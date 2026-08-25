import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export const runtime = "nodejs";

const ACTIVE_STATUSES = new Set(["PAID", "SUCCESS"]);
const TERMINAL_FAILURE_STATUSES = new Set([
  "FAILED",
  "CANCELLED",
  "EXPIRED",
  "USER_DROPPED",
  "NOT_ATTEMPTED",
]);

function readOrderId(payload: Record<string, unknown>) {
  return (
    (typeof payload.order_id === "string" && payload.order_id) ||
    (typeof payload.orderId === "string" && payload.orderId) ||
    (typeof payload?.data === "object" &&
      payload.data !== null &&
      typeof (payload.data as Record<string, unknown>).order_id === "string" &&
      ((payload.data as Record<string, unknown>).order_id as string)) ||
    null
  );
}

function readStatus(payload: Record<string, unknown>) {
  const directStatus =
    typeof payload.order_status === "string"
      ? payload.order_status
      : typeof payload.payment_status === "string"
        ? payload.payment_status
        : typeof payload.status === "string"
          ? payload.status
          : null;

  if (directStatus) return directStatus;

  if (typeof payload.data === "object" && payload.data !== null) {
    const data = payload.data as Record<string, unknown>;
    return (
      (typeof data.order_status === "string" && data.order_status) ||
      (typeof data.payment_status === "string" && data.payment_status) ||
      (typeof data.status === "string" && data.status) ||
      null
    );
  }

  return null;
}

function readFirebaseUid(payload: Record<string, unknown>, orderId: string) {
  const tags =
    typeof payload.order_tags === "object" && payload.order_tags !== null
      ? (payload.order_tags as Record<string, unknown>)
      : typeof payload.tags === "object" && payload.tags !== null
        ? (payload.tags as Record<string, unknown>)
        : null;

  if (tags && typeof tags.firebase_uid === "string") {
    return tags.firebase_uid;
  }

  const match = orderId.match(/^LO_([^_]+)_/);
  return match?.[1] ?? null;
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const orderId = readOrderId(payload);
    const orderStatus = readStatus(payload);

    if (!orderId || !orderStatus) {
      return NextResponse.json(
        { message: "Invalid webhook payload." },
        { status: 400 },
      );
    }

    const uid = readFirebaseUid(payload, orderId);
    if (!uid) {
      return NextResponse.json(
        { message: "Unable to resolve user for payment." },
        { status: 400 },
      );
    }

    const userRef = adminDb.collection("users").doc(uid);
    const userSnapshot = await userRef.get();
    const userData = userSnapshot.data();

    if (ACTIVE_STATUSES.has(orderStatus)) {
      const existingEndDate = userData?.subscriptionEndsAt?.toDate?.();
      const alreadyActive =
        userData?.subscriptionStatus === "active" &&
        existingEndDate &&
        existingEndDate > new Date();

      if (!alreadyActive) {
        const nextSubscriptionEndsAt = new Date();
        nextSubscriptionEndsAt.setDate(nextSubscriptionEndsAt.getDate() + 30);

        await userRef.set(
          {
            plan: "monthly",
            subscriptionStatus: "active",
            subscriptionStartedAt: FieldValue.serverTimestamp(),
            subscriptionEndsAt: nextSubscriptionEndsAt,
            updatedAt: FieldValue.serverTimestamp(),
            paymentProvider: "cashfree",
            paymentOrderId: orderId,
            lastPaymentStatus: orderStatus,
          },
          { merge: true },
        );
      } else {
        await userRef.set(
          {
            updatedAt: FieldValue.serverTimestamp(),
            paymentProvider: "cashfree",
            paymentOrderId: orderId,
            lastPaymentStatus: orderStatus,
          },
          { merge: true },
        );
      }

      return NextResponse.json({ ok: true });
    }

    if (TERMINAL_FAILURE_STATUSES.has(orderStatus)) {
      await userRef.set(
        {
          updatedAt: FieldValue.serverTimestamp(),
          paymentProvider: "cashfree",
          paymentOrderId: orderId,
          lastPaymentStatus: orderStatus,
        },
        { merge: true },
      );

      return NextResponse.json({ ok: true });
    }

    await userRef.set(
      {
        updatedAt: FieldValue.serverTimestamp(),
        paymentProvider: "cashfree",
        paymentOrderId: orderId,
        lastPaymentStatus: orderStatus,
      },
      { merge: true },
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Payment webhook error:", error);

    return NextResponse.json(
      { message: "Unable to process payment webhook." },
      { status: 500 },
    );
  }
}
