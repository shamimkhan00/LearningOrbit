"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getIdToken } from "firebase/auth";

import { auth } from "@/lib/firebase";

type PaymentState =
  | "checking"
  | "success"
  | "processing"
  | "failed"
  | "error";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const orderId = searchParams.get("order_id");

  const [state, setState] = useState<PaymentState>("checking");
  const [message, setMessage] = useState(
    "Verifying your payment..."
  );

  useEffect(() => {
    if (!orderId) {
      setState("error");
      setMessage("No payment order was found.");
      return;
    }

    const safeOrderId = orderId;
    let cancelled = false;
    let attempts = 0;

    async function verifyPayment() {
      try {
        const user = auth.currentUser;

        if (!user) {
          const redirectTarget = encodeURIComponent(
            `/payment/success?order_id=${safeOrderId}`
          );
          router.replace(
            `/sign-in?redirect=${redirectTarget}`
          );
          return;
        }

        const idToken = await getIdToken(user, true);

        const response = await fetch("/api/payment/verify-order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            orderId,
          }),
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to verify payment."
          );
        }

        if (cancelled) return;

        if (data.subscriptionActive) {
          setState("success");
          setMessage("Your LearningOrbit subscription is now active.");

          setTimeout(() => {
            router.replace("/dashboard");
          }, 1800);

          return;
        }

        /*
         * Cashfree may confirm the payment before
         * our webhook finishes updating Firebase.
         *
         * Give the webhook a few seconds to process.
         */
        if (
          data.paymentSuccessful &&
          attempts < 10
        ) {
          attempts += 1;

          setState("processing");
          setMessage(
            "Payment received. Activating your LearningOrbit access..."
          );

          setTimeout(verifyPayment, 1500);

          return;
        }

        if (data.paymentSuccessful) {
          setState("processing");
          setMessage(
            "Payment received. Your subscription is being activated. Please wait a moment."
          );

          return;
        }

        if (data.orderStatus === "ACTIVE") {
          setState("processing");
          setMessage("Waiting for payment confirmation...");

          if (attempts < 10) {
            attempts += 1;
            setTimeout(verifyPayment, 1500);
          }

          return;
        }

        setState("failed");
        setMessage(
          "The payment was not completed."
        );
      } catch (error) {
        console.error("Payment verification error:", error);

        if (!cancelled) {
          setState("error");
          setMessage(
            error instanceof Error
              ? error.message
              : "Unable to verify payment."
          );
        }
      }
    }

    verifyPayment();

    return () => {
      cancelled = true;
    };
  }, [orderId, router]);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0F172A",
        color: "#F8FAFC",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        fontFamily:
          "var(--font-inter, 'Inter', 'Segoe UI', system-ui, sans-serif)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          textAlign: "center",
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: "64px",
            height: "64px",
            margin: "0 auto 1.5rem",
            borderRadius: "50%",
            background:
              state === "success"
                ? "rgba(16,185,129,0.12)"
                : state === "failed" || state === "error"
                  ? "rgba(239,68,68,0.12)"
                  : "rgba(99,102,241,0.12)",
            border:
              state === "success"
                ? "1px solid rgba(16,185,129,0.3)"
                : state === "failed" || state === "error"
                  ? "1px solid rgba(239,68,68,0.3)"
                  : "1px solid rgba(99,102,241,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {state === "success" ? (
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M20 6L9 17l-5-5"
                stroke="#34D399"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : state === "failed" || state === "error" ? (
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M12 8v4"
                stroke="#F87171"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M12 16h.01"
                stroke="#F87171"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle
                cx="12"
                cy="12"
                r="9"
                stroke="#F87171"
                strokeWidth="1.5"
              />
            </svg>
          ) : (
            <div
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                border: "2px solid rgba(167,139,250,0.25)",
                borderTopColor: "#A78BFA",
                animation: "spin 0.8s linear infinite",
              }}
            />
          )}
        </div>

        <h1
          style={{
            fontSize: "1.6rem",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            margin: 0,
          }}
        >
          {state === "success"
            ? "Payment successful"
            : state === "failed"
              ? "Payment not completed"
              : state === "error"
                ? "Something went wrong"
                : "Processing payment"}
        </h1>

        <p
          style={{
            color: "#94A3B8",
            fontSize: "0.9rem",
            lineHeight: 1.6,
            marginTop: "0.75rem",
          }}
        >
          {message}
        </p>

        {orderId && (
          <p
            style={{
              color: "#475569",
              fontSize: "0.7rem",
              marginTop: "1.5rem",
              wordBreak: "break-all",
            }}
          >
            Order: {orderId}
          </p>
        )}

        {(state === "failed" || state === "error") && (
          <button
            onClick={() => router.replace("/pricing")}
            style={{
              marginTop: "1.5rem",
              width: "100%",
              padding: "0.85rem",
              border: "none",
              borderRadius: "10px",
              background:
                "linear-gradient(135deg,#6366F1,#8B5CF6)",
              color: "#fff",
              fontWeight: 700,
              fontSize: "0.9rem",
              cursor: "pointer",
            }}
          >
            Back to pricing
          </button>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </main>
  );
}
