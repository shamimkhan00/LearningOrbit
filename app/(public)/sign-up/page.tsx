"use client";

import { signInWithCustomToken, type AuthError } from "firebase/auth";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";

import { useAuthUser } from "@/app/hooks/use-auth-user";
import { auth } from "@/lib/firebase";

type SignupStep = "credentials" | "otp";

type SendOtpResponse = {
  message?: string;
  challengeToken?: string;
  expiresInMinutes?: number;
};

type VerifyOtpResponse = {
  message?: string;
  customToken?: string;
};

export default function Page() {
  const router = useRouter();
  const { loading, user } = useAuthUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [challengeToken, setChallengeToken] = useState("");
  const [step, setStep] = useState<SignupStep>("credentials");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const payload = (await response.json()) as SendOtpResponse;

      if (!response.ok) {
        throw new Error(payload.message || "Unable to send OTP.");
      }

      if (!payload.challengeToken) {
        throw new Error("OTP was sent, but no OTP session was returned.");
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

  const handleVerifyOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsVerifyingOtp(true);

    try {
      const verifyResponse = await fetch("/api/auth/email-otp/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, otp, challengeToken }),
      });

      const verifyPayload = (await verifyResponse.json()) as VerifyOtpResponse;

      if (!verifyResponse.ok) {
        throw new Error(verifyPayload.message || "OTP verification failed.");
      }

      if (!verifyPayload.customToken) {
        throw new Error("Signup succeeded, but no custom token was returned.");
      }

      await signInWithCustomToken(auth, verifyPayload.customToken);
      router.replace("/");
    } catch (error) {
      const authError = error as AuthError;
      setErrorMessage(authError.message || "Unable to complete signup.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  return (
    <div className="flex items-center justify-center flex-col">
      <h1>Create account</h1>
      {loading ? (
        <p className="animate-pulse text-sm uppercase tracking-[0.3em]">
          Loading...
        </p>
      ) : null}
      {!loading ? (
        <form
          className="flex w-full max-w-sm flex-col"
          onSubmit={step === "credentials" ? handleSendOtp : handleVerifyOtp}
        >
          <input
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            placeholder="Email"
            className="mb-4 rounded-md border border-gray-300 px-4 py-2 text-xl text-white"
            required
            disabled={step === "otp"}
          />
          <input
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            placeholder="Password"
            className="mb-4 rounded-md border border-gray-300 px-4 py-2 text-xl text-white"
            required
            disabled={step === "otp"}
            minLength={6}
          />

          {step === "otp" ? (
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              onChange={(e) => setOtp(e.target.value)}
              value={otp}
              placeholder="Enter 6-digit OTP"
              className="mb-4 rounded-md border border-gray-300 px-4 py-2 text-xl text-white"
              required
            />
          ) : null}

          {successMessage ? (
            <p className="mb-4 text-sm text-green-400">{successMessage}</p>
          ) : null}
          {errorMessage ? (
            <p className="mb-4 text-sm text-red-400">{errorMessage}</p>
          ) : null}

          <button
            className="rounded-md bg-yellow-500 px-4 py-2 font-bold text-white disabled:opacity-60"
            disabled={isSendingOtp || isVerifyingOtp}
            type="submit"
          >
            {step === "credentials"
              ? isSendingOtp
                ? "SENDING OTP..."
                : "SEND OTP"
              : isVerifyingOtp
                ? "VERIFYING..."
                : "VERIFY OTP & SIGN UP"}
          </button>

          {step === "otp" ? (
            <button
              className="mt-3 rounded-md border border-white px-4 py-2 font-bold text-white disabled:opacity-60"
              disabled={isSendingOtp || isVerifyingOtp}
              onClick={() => {
                setStep("credentials");
                setOtp("");
                setChallengeToken("");
                setErrorMessage("");
                setSuccessMessage("");
              }}
              type="button"
            >
              CHANGE EMAIL OR PASSWORD
            </button>
          ) : null}
        </form>
      ) : null}
    </div>
  );
}
