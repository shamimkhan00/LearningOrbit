"use client";

import { signInWithEmailAndPassword, type AuthError } from "firebase/auth";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";

import { useAuthUser } from "@/app/hooks/use-auth-user";
import { auth } from "@/lib/firebase";

export default function Page() {
  const router = useRouter();
  const { loading, user } = useAuthUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [loading, router, user]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/");
    } catch (error) {
      const authError = error as AuthError;
      setErrorMessage(authError.message || "Unable to sign in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center flex-col">
      <h1>Sign in page</h1>
      <form className="flex w-full max-w-sm flex-col" onSubmit={onSubmit}>
        <input
          type="email"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          placeholder="Email"
          className="text-xl px-4 py-2 rounded-md border border-gray-300 mb-4 text-black"
          required
        />
        <input
          type="password"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          placeholder="Password"
          className="text-xl px-4 py-2 rounded-md border border-gray-300 mb-4 text-black"
          required
        />
        {errorMessage ? (
          <p className="mb-4 text-sm text-red-400">{errorMessage}</p>
        ) : null}
        <button
          className="bg-yellow-500 text-black px-4 py-2 rounded-md font-bold disabled:opacity-60"
          disabled={isSubmitting || loading}
          type="submit"
        >
          {isSubmitting ? "SIGNING IN..." : "SIGN IN"}
        </button>
      </form>
    </div>
  );
}
