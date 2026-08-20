"use client";

import Link from "next/link";
import { signInWithCustomToken, type AuthError } from "firebase/auth";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { auth } from "@/lib/firebase";

type SignupStep = "credentials" | "otp";
type SendOtpResponse = { message?: string; challengeToken?: string; expiresInMinutes?: number };
type VerifyOtpResponse = { message?: string; customToken?: string };

const inputStyle = {
  width: "100%",
  background: "rgba(15,23,42,0.6)",
  border: "1px solid rgba(99,102,241,0.2)",
  borderRadius: "10px",
  padding: "0.75rem 0.875rem 0.75rem 2.75rem",
  color: "#F1F5F9",
  fontSize: "0.9rem",
  outline: "none",
  boxSizing: "border-box" as const,
  transition: "border-color 0.15s",
};

const labelStyle = {
  display: "block",
  color: "#94A3B8",
  fontSize: "0.8rem",
  fontWeight: 600,
  marginBottom: "0.5rem",
  letterSpacing: "0.02em",
};

function FieldIcon({ path }: { path: string }) {
  return (
    <span
      style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#475569", pointerEvents: "none" }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
        <path d={path} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function Spinner() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="16" height="16" aria-hidden="true" style={{ animation: "spin 0.8s linear infinite" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <circle cx="12" cy="12" r="10" stroke="white" strokeOpacity="0.25" strokeWidth="2.5" />
      <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [challengeToken, setChallengeToken] = useState("");
  const [step, setStep] = useState<SignupStep>("credentials");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // OTP box refs for auto-advance
  const otpRefs = Array.from({ length: 6 }, () => null as HTMLInputElement | null);

  const handleOtpChange = (idx: number, val: string) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[idx] = digit;
    setOtp(next);
    if (digit && idx < 5) otpRefs[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) otpRefs[idx - 1]?.focus();
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      otpRefs[5]?.focus();
      e.preventDefault();
    }
  };

  const otpString = otp.join("");

  const handleSendOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsSendingOtp(true);
    try {
      const res = await fetch("/api/auth/email-otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const payload = (await res.json()) as SendOtpResponse;
      if (!res.ok) throw new Error(payload.message || "Unable to send OTP.");
      if (!payload.challengeToken) throw new Error("OTP was sent, but no session was returned.");
      setChallengeToken(payload.challengeToken);
      setStep("otp");
      setSuccessMessage(payload.message || `OTP sent to ${email}. Expires in ${payload.expiresInMinutes ?? 10} minutes.`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to send OTP.");
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
      const res = await fetch("/api/auth/email-otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, otp: otpString, challengeToken }),
      });
      const payload = (await res.json()) as VerifyOtpResponse;
      if (!res.ok) throw new Error(payload.message || "OTP verification failed.");
      if (!payload.customToken) throw new Error("Signup succeeded, but no custom token was returned.");
      await signInWithCustomToken(auth, payload.customToken);
      router.replace("/setup");
    } catch (error) {
      setErrorMessage((error as AuthError).message || "Unable to complete signup.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleBack = () => {
    setStep("credentials");
    setOtp(["", "", "", "", "", ""]);
    setChallengeToken("");
    setErrorMessage("");
    setSuccessMessage("");
  };

  const isBusy = isSendingOtp || isVerifyingOtp;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0F172A",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        fontFamily: "var(--font-inter, 'Inter', 'Segoe UI', system-ui, sans-serif)",
      }}
    >
      {/* Orbit background */}
      <svg
        style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.5 }}
        viewBox="0 0 900 900"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="sg2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#0F172A" stopOpacity="0" />
          </radialGradient>
          <style>{`
            @keyframes os2{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
            .sd4{transform-box:fill-box;transform-origin:center;animation:os2 20s linear infinite}
            .sd5{transform-box:fill-box;transform-origin:center;animation:os2 13s linear infinite reverse}
            @media(prefers-reduced-motion:reduce){.sd4,.sd5{animation:none}}
          `}</style>
        </defs>
        <circle r="380" cx="450" cy="450" fill="none" stroke="#8B5CF6" strokeOpacity="0.08" strokeWidth="1" />
        <circle r="250" cx="450" cy="450" fill="none" stroke="#6366F1" strokeOpacity="0.08" strokeWidth="1" />
        <g className="sd4"><circle r="4" cx="830" cy="450" fill="#8B5CF6" fillOpacity="0.6" /></g>
        <g className="sd5"><circle r="3" cx="700" cy="450" fill="#6366F1" fillOpacity="0.7" /></g>
        <circle r="300" cx="450" cy="450" fill="url(#sg2)" />
      </svg>

      <div style={{ width: "100%", maxWidth: "440px", position: "relative", zIndex: 10 }}>

        {/* Logo */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "2.5rem" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }} aria-label="LearningOrbit home">
            <span style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", width: "38px", height: "38px", flexShrink: 0, boxShadow: "0 0 20px rgba(99,102,241,0.4)" }}>
              <svg viewBox="0 0 24 24" fill="none" width="20" height="20" aria-hidden="true">
                <circle cx="12" cy="12" r="3" fill="white" />
                <ellipse cx="12" cy="12" rx="10" ry="4.5" stroke="white" strokeWidth="1.5" fill="none" />
                <ellipse cx="12" cy="12" rx="10" ry="4.5" stroke="white" strokeWidth="1.5" fill="none" transform="rotate(60 12 12)" />
                <ellipse cx="12" cy="12" rx="10" ry="4.5" stroke="white" strokeWidth="1.5" fill="none" transform="rotate(120 12 12)" />
              </svg>
            </span>
            <span style={{ fontWeight: 700, fontSize: "1.15rem", letterSpacing: "-0.02em", color: "#F8FAFC" }}>LearningOrbit</span>
          </Link>
        </div>

        {/* Card */}
        <div
          style={{
            background: "rgba(30,41,59,0.7)",
            border: "1px solid rgba(99,102,241,0.2)",
            borderRadius: "18px",
            padding: "2.25rem 2rem",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            boxShadow: "0 25px 50px rgba(0,0,0,0.4), 0 0 0 1px rgba(99,102,241,0.1)",
          }}
        >
          {/* Step indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1.75rem" }}>
            {/* Step 1 pip */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "linear-gradient(135deg,#6366F1,#8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {step === "otp" ? (
                  <svg viewBox="0 0 24 24" fill="none" width="12" height="12" aria-hidden="true">
                    <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <span style={{ color: "white", fontSize: "0.7rem", fontWeight: 700 }}>1</span>
                )}
              </div>
              <span style={{ color: step === "credentials" ? "#F1F5F9" : "#64748B", fontSize: "0.78rem", fontWeight: 600 }}>Details</span>
            </div>
            {/* connector */}
            <div style={{ flex: 1, height: "1px", background: step === "otp" ? "rgba(99,102,241,0.5)" : "rgba(99,102,241,0.15)" }} />
            {/* Step 2 pip */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: step === "otp" ? "linear-gradient(135deg,#6366F1,#8B5CF6)" : "rgba(99,102,241,0.15)", border: step === "otp" ? "none" : "1px solid rgba(99,102,241,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ color: step === "otp" ? "white" : "#475569", fontSize: "0.7rem", fontWeight: 700 }}>2</span>
              </div>
              <span style={{ color: step === "otp" ? "#F1F5F9" : "#475569", fontSize: "0.78rem", fontWeight: 600 }}>Verify email</span>
            </div>
          </div>

          {/* Heading */}
          <div style={{ marginBottom: "1.5rem" }}>
            <h1 style={{ color: "#F8FAFC", fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "0.4rem" }}>
              {step === "credentials" ? "Create your account" : "Check your inbox"}
            </h1>
            <p style={{ color: "#64748B", fontSize: "0.875rem" }}>
              {step === "credentials"
                ? "Start building your AI study roadmap today"
                : `We sent a 6-digit code to ${email}`}
            </p>
          </div>

          {/* ── STEP 1: Credentials ── */}
          {step === "credentials" && (
            <form onSubmit={handleSendOtp} noValidate>
              {/* Email */}
              <div style={{ marginBottom: "1rem" }}>
                <label htmlFor="email" style={labelStyle}>Email address</label>
                <div style={{ position: "relative" }}>
                  <FieldIcon path="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "rgba(99,102,241,0.6)")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(99,102,241,0.2)")}
                  />
                </div>
              </div>

              {/* Password */}
              <div style={{ marginBottom: "0.5rem" }}>
                <label htmlFor="password" style={labelStyle}>Password <span style={{ color: "#475569", fontWeight: 400 }}>(min. 6 characters)</span></label>
                <div style={{ position: "relative" }}>
                  <FieldIcon path="M21 2H3v16h18V2zM7 11V7a5 5 0 0110 0v4" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    style={{ ...inputStyle, paddingRight: "2.75rem" }}
                    onFocus={(e) => (e.target.style.borderColor = "rgba(99,102,241,0.6)")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(99,102,241,0.2)")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#475569", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center" }}
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" /></svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Password strength bar */}
              {password.length > 0 && (
                <div style={{ marginTop: "0.5rem", marginBottom: "0.25rem" }}>
                  <div style={{ height: "3px", borderRadius: "2px", background: "rgba(99,102,241,0.1)", overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      borderRadius: "2px",
                      width: password.length < 6 ? "33%" : password.length < 10 ? "66%" : "100%",
                      background: password.length < 6 ? "#EF4444" : password.length < 10 ? "#F59E0B" : "#10B981",
                      transition: "width 0.3s, background 0.3s",
                    }} />
                  </div>
                  <p style={{ color: password.length < 6 ? "#EF4444" : password.length < 10 ? "#F59E0B" : "#10B981", fontSize: "0.72rem", marginTop: "4px" }}>
                    {password.length < 6 ? "Too short" : password.length < 10 ? "Good" : "Strong"}
                  </p>
                </div>
              )}

              {errorMessage && <ErrorAlert message={errorMessage} />}

              <button
                type="submit"
                disabled={isBusy}
                style={{ width: "100%", marginTop: "1.5rem", background: isBusy ? "rgba(99,102,241,0.5)" : "linear-gradient(135deg,#6366F1,#8B5CF6)", color: "#fff", border: "none", borderRadius: "10px", padding: "0.85rem", fontWeight: 700, fontSize: "0.95rem", letterSpacing: "-0.01em", cursor: isBusy ? "not-allowed" : "pointer", boxShadow: isBusy ? "none" : "0 0 24px rgba(99,102,241,0.35)", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
              >
                {isSendingOtp && <Spinner />}
                {isSendingOtp ? "Sending code…" : "Send verification code"}
              </button>
            </form>
          )}

          {/* ── STEP 2: OTP ── */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} noValidate>
              {/* Success banner */}
              {successMessage && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: "8px", padding: "0.65rem 0.875rem", marginBottom: "1.25rem" }}>
                  <svg viewBox="0 0 24 24" fill="none" width="15" height="15" style={{ flexShrink: 0, marginTop: "1px" }} aria-hidden="true">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M22 4L12 14.01l-3-3" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p style={{ color: "#6EE7B7", fontSize: "0.82rem", lineHeight: 1.45 }}>{successMessage}</p>
                </div>
              )}

              {/* OTP boxes */}
              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{ ...labelStyle, marginBottom: "0.75rem" }}>Enter 6-digit code</label>
                <div style={{ display: "flex", gap: "8px", justifyContent: "center" }} onPaste={handleOtpPaste}>
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => { otpRefs[idx] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      aria-label={`OTP digit ${idx + 1}`}
                      style={{
                        width: "46px",
                        height: "54px",
                        textAlign: "center",
                        fontSize: "1.4rem",
                        fontWeight: 700,
                        background: "rgba(15,23,42,0.6)",
                        border: digit ? "1px solid rgba(99,102,241,0.6)" : "1px solid rgba(99,102,241,0.2)",
                        borderRadius: "10px",
                        color: "#F1F5F9",
                        outline: "none",
                        caretColor: "#6366F1",
                        transition: "border-color 0.15s",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "rgba(99,102,241,0.7)")}
                      onBlur={(e) => (e.target.style.borderColor = digit ? "rgba(99,102,241,0.6)" : "rgba(99,102,241,0.2)")}
                    />
                  ))}
                </div>
              </div>

              {errorMessage && <ErrorAlert message={errorMessage} />}

              <button
                type="submit"
                disabled={isBusy || otpString.length < 6}
                style={{ width: "100%", marginTop: "1.25rem", background: (isBusy || otpString.length < 6) ? "rgba(99,102,241,0.4)" : "linear-gradient(135deg,#6366F1,#8B5CF6)", color: "#fff", border: "none", borderRadius: "10px", padding: "0.85rem", fontWeight: 700, fontSize: "0.95rem", letterSpacing: "-0.01em", cursor: (isBusy || otpString.length < 6) ? "not-allowed" : "pointer", boxShadow: (isBusy || otpString.length < 6) ? "none" : "0 0 24px rgba(99,102,241,0.35)", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
              >
                {isVerifyingOtp && <Spinner />}
                {isVerifyingOtp ? "Creating account…" : "Verify & create account"}
              </button>

              <button
                type="button"
                onClick={handleBack}
                disabled={isBusy}
                style={{ width: "100%", marginTop: "0.75rem", background: "transparent", color: "#64748B", border: "1px solid rgba(99,102,241,0.15)", borderRadius: "10px", padding: "0.75rem", fontWeight: 600, fontSize: "0.85rem", cursor: isBusy ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
              >
                <svg viewBox="0 0 24 24" fill="none" width="14" height="14" aria-hidden="true">
                  <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Change email or password
              </button>
            </form>
          )}
        </div>

        {/* Footer link */}
        <p style={{ textAlign: "center", marginTop: "1.5rem", color: "#475569", fontSize: "0.875rem" }}>
          Already have an account?{" "}
          <Link href="/sign-in" style={{ color: "#A78BFA", fontWeight: 600, textDecoration: "none" }}>
            Sign in →
          </Link>
        </p>
      </div>
    </div>
  );
}

function ErrorAlert({ message }: { message: string }) {
  return (
    <div
      role="alert"
      style={{ display: "flex", alignItems: "flex-start", gap: "8px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "8px", padding: "0.65rem 0.875rem", marginTop: "1rem" }}
    >
      <svg viewBox="0 0 24 24" fill="none" width="15" height="15" style={{ flexShrink: 0, marginTop: "1px" }} aria-hidden="true">
        <circle cx="12" cy="12" r="10" stroke="#EF4444" strokeWidth="1.8" />
        <line x1="12" y1="8" x2="12" y2="12" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="12" y1="16" x2="12.01" y2="16" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <p style={{ color: "#FCA5A5", fontSize: "0.82rem", lineHeight: 1.45 }}>{message}</p>
    </div>
  );
}