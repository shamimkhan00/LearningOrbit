import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";

const CASHFREE_API_URL = "https://api.cashfree.com";
const CASHFREE_API_VERSION = "2025-01-01";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Authentication required." },
        { status: 401 },
      );
    }

    const idToken = authHeader.substring(7);
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    const { orderId } = (await request.json()) as {
      orderId?: string;
    };

    if (!orderId) {
      return NextResponse.json(
        { message: "Order ID is required." },
        { status: 400 },
      );
    }

    // Make sure this order belongs to this Firebase user.
    if (!orderId.startsWith(`LO_${decodedToken.uid}_`)) {
      return NextResponse.json(
        { message: "Invalid order." },
        { status: 403 },
      );
    }

    const response = await fetch(
      `${CASHFREE_API_URL}/pg/orders/${encodeURIComponent(orderId)}`,
      {
        method: "GET",
        headers: {
          "x-client-id": process.env.CASHFREE_CLIENT_ID!,
          "x-client-secret": process.env.CASHFREE_CLIENT_SECRET!,
          "x-api-version": CASHFREE_API_VERSION,
        },
        cache: "no-store",
      },
    );

    const order = await response.json();

    if (!response.ok) {
      console.error("Cashfree order verification error:", order);

      return NextResponse.json(
        { message: "Unable to verify payment." },
        { status: 500 },
      );
    }

    const userRef = adminDb.collection("users").doc(decodedToken.uid);
    const userSnapshot = await userRef.get();

    const userData = userSnapshot.data();

    const subscriptionActive =
      userData?.subscriptionStatus === "active" &&
      userData?.subscriptionEndsAt?.toDate?.() > new Date();

    return NextResponse.json({
      orderStatus: order.order_status,
      paymentSuccessful: order.order_status === "PAID",
      subscriptionActive,
      subscriptionEndsAt:
        userData?.subscriptionEndsAt?.toDate?.()?.toISOString() ?? null,
    });
  } catch (error) {
    console.error("Verify order error:", error);

    return NextResponse.json(
      { message: "Unable to verify payment." },
      { status: 500 },
    );
  }
}