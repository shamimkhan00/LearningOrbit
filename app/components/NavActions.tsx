"use client";

import Link from "next/link";
import { useState } from "react";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuthUser } from "@/app/hooks/use-auth-user";
import { auth } from "@/lib/firebase";

export function NavActions() {
  const { user, loading } = useAuthUser();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const router = useRouter();

  // Redirect signed-in users straight to dashboard
  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [loading, user, router]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut(auth);
    } finally {
      setIsSigningOut(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{ background: "#1E293B", borderRadius: "8px" }}
        className="h-9 w-24 md:w-28 animate-pulse"
        aria-label="Loading..."
      />
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-2 md:gap-3">
        <Link
          href="/dashboard"
          style={{
            background: "linear-gradient(135deg,#6366F1,#8B5CF6)",
            color: "#fff",
            borderRadius: "8px",
            fontWeight: 600,
            fontSize: "0.875rem",
            padding: "0.5rem 1rem",
          }}
          className="hover:opacity-90 transition-opacity whitespace-nowrap text-xs md:text-sm md:px-4.5"
        >
          Dashboard →
        </Link>
        {/* Hidden on mobile, appears on medium screens and up */}
        <button
          onClick={handleSignOut}
          disabled={isSigningOut}
          style={{ color: "#94A3B8", fontSize: "0.875rem", fontWeight: 500 }}
          className="hidden md:block hover:text-white transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          {isSigningOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 md:gap-3">
      {/* Hidden on mobile, appears on medium screens and up */}
      <Link
        href="/sign-in"
        style={{ color: "#A78BFA", fontWeight: 500, fontSize: "0.875rem" }}
        className="hidden md:block hover:text-white transition-colors px-2 whitespace-nowrap"
      >
        Sign in
      </Link>
      <Link
        href="/sign-up"
        style={{
          background: "linear-gradient(135deg,#6366F1,#8B5CF6)",
          color: "#fff",
          borderRadius: "8px",
          fontWeight: 600,
          fontSize: "0.875rem",
          padding: "0.5rem 1rem",
        }}
        className="hover:opacity-90 transition-opacity whitespace-nowrap text-xs md:text-sm md:px-4.5"
      >
        Get started free
      </Link>
    </div>
  );
}