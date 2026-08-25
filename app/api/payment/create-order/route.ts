import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

export const runtime = "nodejs";

const CASHFREE_API_URL = "https://api.cashfree.com/pg/orders";
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

        const uid = decodedToken.uid;
        const email = decodedToken.email;

        if (!email) {
            return NextResponse.json(
                { message: "Your account does not have an email address." },
                { status: 400 },
            );
        }

        const orderId = `LO_${uid}_${Date.now()}`;

        const response = await fetch(CASHFREE_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-client-id": process.env.CASHFREE_CLIENT_ID!,
                "x-client-secret": process.env.CASHFREE_CLIENT_SECRET!,
                "x-api-version": CASHFREE_API_VERSION,
                "x-idempotency-key": crypto.randomUUID(),
            },
            body: JSON.stringify({
                order_id: orderId,
                order_amount: 59,
                order_currency: "INR",

                customer_details: {
                    customer_id: uid,
                    customer_email: email,
                },

                order_meta: {
                    return_url: `https://learnorbit.com/payment/success?order_id={order_id}`,
                    notify_url: "https://learnorbit.com/api/payment/webhook",
                },

                order_tags: {
                    firebase_uid: uid,
                    plan: "monthly",
                },


                order_note: "LearningOrbit Monthly Subscription",
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Cashfree create order error:", data);

            return NextResponse.json(
                {
                    message: "Unable to create payment order.",
                    details: data,
                },
                { status: response.status },
            );
        }

        return NextResponse.json({
            orderId,
            paymentSessionId: data.payment_session_id,
        });
    } catch (error) {
        console.error("Create Cashfree order error:", error);

        return NextResponse.json(
            { message: "Unable to create payment order." },
            { status: 500 },
        );
    }
}