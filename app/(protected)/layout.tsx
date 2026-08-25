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
          router.replace("/pricing");
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

  if (!user || !hasAccess) {
    return null;
  }

  return children;
}