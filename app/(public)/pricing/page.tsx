"use client";

import { useState } from "react";
import { getIdToken } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function PricingPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubscribe = async () => {
    setError("");
    setLoading(true);

    try {
      const user = auth.currentUser;

      if (!user) {
        window.location.href = "/sign-in";
        return;
      }

      const idToken = await getIdToken(user, true);

      const response = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to start payment.");
      }

      if (!data.paymentSessionId) {
        throw new Error("Payment session was not created.");
      }

      const { load } = await import("@cashfreepayments/cashfree-js");

      const cashfree = await load({
        mode: "production",
      });

      if (!cashfree) {
        throw new Error("Unable to load Cashfree Checkout.");
      }

      await cashfree.checkout({
        paymentSessionId: data.paymentSessionId,
        redirectTarget: "_self",
      });
    } catch (error) {
      console.error("Payment error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to start payment.",
      );

      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0F172A",
        color: "#F8FAFC",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        fontFamily:
          "var(--font-inter, 'Inter', 'Segoe UI', system-ui, sans-serif)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          textAlign: "center",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "2rem",
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "12px",
              background: "linear-gradient(135deg,#6366F1,#8B5CF6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 25px rgba(99,102,241,0.35)",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              width="22"
              height="22"
            >
              <circle cx="12" cy="12" r="3" fill="white" />
              <ellipse
                cx="12"
                cy="12"
                rx="10"
                ry="4.5"
                stroke="white"
                strokeWidth="1.5"
              />
              <ellipse
                cx="12"
                cy="12"
                rx="10"
                ry="4.5"
                stroke="white"
                strokeWidth="1.5"
                transform="rotate(60 12 12)"
              />
              <ellipse
                cx="12"
                cy="12"
                rx="10"
                ry="4.5"
                stroke="white"
                strokeWidth="1.5"
                transform="rotate(120 12 12)"
              />
            </svg>
          </div>
        </div>

        {/* Heading */}
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 800,
            letterSpacing: "-0.04em",
            margin: 0,
          }}
        >
          Continue using LearningOrbit
        </h1>

        <p
          style={{
            color: "#94A3B8",
            fontSize: "0.95rem",
            lineHeight: 1.6,
            marginTop: "0.75rem",
            marginBottom: "2rem",
          }}
        >
          Your 7-day free trial has ended.
          <br />
          Continue your learning journey for a small monthly fee.
        </p>

        {/* Pricing card */}
        <div
          style={{
            background: "rgba(30,41,59,0.75)",
            border: "1px solid rgba(99,102,241,0.35)",
            borderRadius: "20px",
            padding: "2rem",
            textAlign: "left",
            backdropFilter: "blur(16px)",
            boxShadow:
              "0 25px 60px rgba(0,0,0,0.35), 0 0 35px rgba(99,102,241,0.08)",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <p
              style={{
                color: "#A78BFA",
                fontSize: "0.8rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                margin: 0,
              }}
            >
              Monthly Plan
            </p>

            <div
              style={{
                marginTop: "0.5rem",
                display: "flex",
                justifyContent: "center",
                alignItems: "baseline",
                gap: "5px",
              }}
            >
              <span
                style={{
                  fontSize: "2.75rem",
                  fontWeight: 800,
                  letterSpacing: "-0.05em",
                }}
              >
                ₹59
              </span>

              <span
                style={{
                  color: "#64748B",
                  fontSize: "0.9rem",
                }}
              >
                / month
              </span>
            </div>
          </div>

          {/* Features */}
          <div
            style={{
              marginTop: "1.75rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.85rem",
            }}
          >
            {[
              "Full LearningOrbit access",
              "Personalized study roadmap",
              "Progress tracking",
            ].map((feature) => (
              <div
                key={feature}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  color: "#CBD5E1",
                  fontSize: "0.88rem",
                }}
              >
                <span
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: "rgba(99,102,241,0.15)",
                    color: "#A78BFA",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    fontSize: "0.75rem",
                  }}
                >
                  ✓
                </span>

                {feature}
              </div>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                marginTop: "1.25rem",
                padding: "0.75rem",
                borderRadius: "9px",
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.25)",
                color: "#FCA5A5",
                fontSize: "0.82rem",
              }}
            >
              {error}
            </div>
          )}

          {/* Payment button */}
          <button
            type="button"
            onClick={handleSubscribe}
            disabled={loading}
            style={{
              width: "100%",
              marginTop: "1.75rem",
              padding: "0.9rem",
              border: "none",
              borderRadius: "10px",
              background: loading
                ? "rgba(99,102,241,0.45)"
                : "linear-gradient(135deg,#6366F1,#8B5CF6)",
              color: "white",
              fontSize: "0.95rem",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: loading
                ? "none"
                : "0 0 25px rgba(99,102,241,0.3)",
            }}
          >
            {loading ? "Opening payment..." : "Continue for ₹59"}
          </button>

          <p
            style={{
              textAlign: "center",
              color: "#475569",
              fontSize: "0.72rem",
              marginTop: "0.85rem",
              marginBottom: 0,
            }}
          >
            Secure payment powered by Cashfree
          </p>
        </div>
      </div>
    </main>
  );
}