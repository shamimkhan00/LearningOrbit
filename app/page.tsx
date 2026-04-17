"use client";

import Link from "next/link";
import { signOut } from "firebase/auth";
import { useEffect, useState } from "react";

import { SignedIn } from "./components/signed-in";
import { SignedOut } from "./components/signed-out";
import { useAuthUser } from "./hooks/use-auth-user";
import { auth, getFirebaseAnalytics } from "@/lib/firebase";

export default function Home() {
  const { user, loading } = useAuthUser();
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    void getFirebaseAnalytics();
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);

    try {
      await signOut(auth);
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="bg-black">
      <h1>NextJS + Firebase Auth</h1>
      {loading ? (
        <p className="mx-auto w-fit animate-pulse text-sm uppercase tracking-[0.3em]">
          Loading session...
        </p>
      ) : (
        <>
          <SignedIn>
            <div className="flex flex-col text-primary-500">
              <h1 className="text-3xl font-bold">Signed in as</h1>
              <p>{user?.email}</p>
              <button
                onClick={handleSignOut}
                className="text-red-500 font-bold disabled:opacity-60"
                disabled={isSigningOut}
              >
                {isSigningOut ? "Signing out..." : "Sign out"}
              </button>
            </div>
          </SignedIn>
          <SignedOut>
            <Link className="mr-4 underline" href="/sign-in">
              Sign in
            </Link>
            <Link className="mr-4 underline" href="/sign-up">
              Create account
            </Link>
          </SignedOut>
        </>
      )}
    </div>
  );
}
