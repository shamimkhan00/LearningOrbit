"use client";

import { signInWithCustomToken, type AuthError } from "firebase/auth";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";

import { useAuthUser } from "@/app/hooks/use-auth-user";
import { auth } from "@/lib/firebase";

type Step = "email" | "otp";

type SendOtpResponse = {
  message?: string;
  challengeToken?: string;
  expiresInMinutes?: number;
};

type ResetPasswordResponse = {
  message?: string;
  customToken?: string;
};

export default function Page() {
  const router = useRouter();
  const { loading, user } = useAuthUser();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [challengeToken, setChallengeToken] = useState("");
  const [step, setStep] = useState<Step>("email");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [loading, router, user]);

  const handleSendOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsSendingOtp(true);

    try {
      const response = await fetch("/api/auth/email-otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const payload = (await response.json()) as SendOtpResponse;

      if (!response.ok) {
        throw new Error(payload.message || "Unable to send OTP.");
      }

      if (!payload.challengeToken) {
        throw new Error("OTP was sent, but no session was returned.");
      }

      setChallengeToken(payload.challengeToken);
      setStep("otp");
      setSuccessMessage(
        payload.message ||
          `OTP sent to your inbox. It expires in ${payload.expiresInMinutes ?? 10} minutes.`,
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to send OTP.",
      );
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleResetPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsResetting(true);

    try {
      const response = await fetch("/api/auth/forgot-password/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword, otp, challengeToken }),
      });

      const payload = (await response.json()) as ResetPasswordResponse;

      if (!response.ok) {
        throw new Error(payload.message || "Password reset failed.");
      }

      if (!payload.customToken) {
        throw new Error("Reset succeeded but no token was returned.");
      }

      await signInWithCustomToken(auth, payload.customToken);
      router.replace("/");
    } catch (error) {
      const authError = error as AuthError;
      setErrorMessage(authError.message || "Unable to reset password.");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="flex items-center justify-center flex-col">
      <h1>Forgot password</h1>
      {loading ? (
        <p className="animate-pulse text-sm uppercase tracking-[0.3em]">
          Loading...
        </p>
      ) : null}
      {!loading ? (
        <form
          className="flex w-full max-w-sm flex-col"
          onSubmit={step === "email" ? handleSendOtp : handleResetPassword}
        >
          <input
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            placeholder="Email"
            className="mb-4 rounded-md border border-gray-300 px-4 py-2 text-xl text-black"
            required
            disabled={step === "otp"}
          />

          {step === "otp" ? (
            <>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                onChange={(e) => setOtp(e.target.value)}
                value={otp}
                placeholder="Enter 6-digit OTP"
                className="mb-4 rounded-md border border-gray-300 px-4 py-2 text-xl text-black"
                required
              />
              <input
                type="password"
                onChange={(e) => setNewPassword(e.target.value)}
                value={newPassword}
                placeholder="New password"
                className="mb-4 rounded-md border border-gray-300 px-4 py-2 text-xl text-black"
                required
                minLength={6}
              />
            </>
          ) : null}

          {successMessage ? (
            <p className="mb-4 text-sm text-green-400">{successMessage}</p>
          ) : null}
          {errorMessage ? (
            <p className="mb-4 text-sm text-red-400">{errorMessage}</p>
          ) : null}

          <button
            className="rounded-md bg-yellow-500 px-4 py-2 font-bold text-black disabled:opacity-60"
            disabled={isSendingOtp || isResetting}
            type="submit"
          >
            {step === "email"
              ? isSendingOtp
                ? "SENDING OTP..."
                : "SEND OTP"
              : isResetting
                ? "RESETTING..."
                : "RESET PASSWORD"}
          </button>

          {step === "otp" ? (
            <button
              className="mt-3 rounded-md border border-white px-4 py-2 font-bold text-white disabled:opacity-60"
              disabled={isSendingOtp || isResetting}
              onClick={() => {
                setStep("email");
                setOtp("");
                setChallengeToken("");
                setErrorMessage("");
                setSuccessMessage("");
              }}
              type="button"
            >
              CHANGE EMAIL
            </button>
          ) : null}
        </form>
      ) : null}
    </div>
  );
}