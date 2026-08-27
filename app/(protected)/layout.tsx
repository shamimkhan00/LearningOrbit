"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";

import { useAuth } from "@/providers/AuthProvider";
import { db } from "@/lib/firebase";
import { hasActiveAccess } from "@/lib/subscription";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [checkingAccess, setCheckingAccess] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [accessError, setAccessError] = useState("");

  useEffect(() => {
    if (loading) return;

    if (!user) {
      alert("User needs to log in / sign up");
      router.replace("/");
      return;
    }

    let cancelled = false;

    async function checkSubscription() {
      if (!user) return;

      try {
        const userRef = doc(db, "users", user.uid);
        const snapshot = await getDoc(userRef);

        if (!snapshot.exists()) {
          router.replace("/pricing");
          return;
        }

        const access = hasActiveAccess(snapshot.data());

        if (cancelled) return;

        if (!access) {
          router.replace("/pricing");
          return;
        }

        setHasAccess(true);
      } catch (error) {
        console.error("Subscription check failed:", error);

        if (!cancelled) {
          setAccessError(
            "We could not verify your subscription right now. Please check your connection and try again.",
          );
        }
      } finally {
        if (!cancelled) {
          setCheckingAccess(false);
        }
      }
    }

    checkSubscription();

    return () => {
      cancelled = true;
    };
  }, [loading, user, router]);

  if (loading || checkingAccess) {
    return <div>Loading...</div>;
  }

  if (!user || (!hasAccess && !accessError)) {
    return null;
  }

  if (accessError) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 520 }}>
          <h1 style={{ marginBottom: 12 }}>Subscription check paused</h1>
          <p style={{ marginBottom: 20 }}>{accessError}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "12px 18px",
              borderRadius: 10,
              border: "none",
              cursor: "pointer",
              background: "linear-gradient(135deg,#6366F1,#8B5CF6)",
              color: "#fff",
              fontWeight: 700,
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return children;
}
