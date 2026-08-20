"use client";

import Link from "next/link";
import { signInWithEmailAndPassword, type AuthError } from "firebase/auth";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { auth } from "@/lib/firebase";

function getFriendlyAuthErrorMessage(error: AuthError) {
  switch (error.code) {
    case "auth/invalid-credential":
      return "Incorrect email or password.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";
    default:
      return error.message || "Unable to sign in.";
  }
}

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/dashboard");
    } catch (error) {
      setErrorMessage(getFriendlyAuthErrorMessage(error as AuthError));
    } finally {
      setIsSubmitting(false);
    }
  };

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
      {/* Subtle orbit background */}
      <svg
        style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.5 }}
        viewBox="0 0 900 900"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="sg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#6366F1" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#0F172A" stopOpacity="0" />
          </radialGradient>
          <style>{`
            @keyframes os{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
            .sd{transform-box:fill-box;transform-origin:center}
            .sd1{animation:os 22s linear infinite}
            .sd2{animation:os 14s linear infinite reverse}
            @media(prefers-reduced-motion:reduce){.sd1,.sd2{animation:none}}
          `}</style>
        </defs>
        <circle r="380" cx="450" cy="450" fill="none" stroke="#6366F1" strokeOpacity="0.08" strokeWidth="1" />
        <circle r="260" cx="450" cy="450" fill="none" stroke="#8B5CF6" strokeOpacity="0.08" strokeWidth="1" />
        <g className="sd sd1"><circle r="4" cx="830" cy="450" fill="#6366F1" fillOpacity="0.6" /></g>
        <g className="sd sd2"><circle r="3" cx="710" cy="450" fill="#8B5CF6" fillOpacity="0.7" /></g>
        <circle r="300" cx="450" cy="450" fill="url(#sg)" />
      </svg>

      <div style={{ width: "100%", maxWidth: "420px", position: "relative", zIndex: 10 }}>

        {/* Logo */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "2.5rem" }}>
          <Link
            href="/"
            style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}
            aria-label="LearningOrbit home"
          >
            <span
              style={{
                background: "linear-gradient(135deg,#6366F1,#8B5CF6)",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "38px",
                height: "38px",
                flexShrink: 0,
                boxShadow: "0 0 20px rgba(99,102,241,0.4)",
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" width="20" height="20" aria-hidden="true">
                <circle cx="12" cy="12" r="3" fill="white" />
                <ellipse cx="12" cy="12" rx="10" ry="4.5" stroke="white" strokeWidth="1.5" fill="none" />
                <ellipse cx="12" cy="12" rx="10" ry="4.5" stroke="white" strokeWidth="1.5" fill="none" transform="rotate(60 12 12)" />
                <ellipse cx="12" cy="12" rx="10" ry="4.5" stroke="white" strokeWidth="1.5" fill="none" transform="rotate(120 12 12)" />
              </svg>
            </span>
            <span style={{ fontWeight: 700, fontSize: "1.15rem", letterSpacing: "-0.02em", color: "#F8FAFC" }}>
              LearningOrbit
            </span>
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
          <div style={{ marginBottom: "1.75rem" }}>
            <h1
              style={{
                color: "#F8FAFC",
                fontSize: "1.5rem",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                marginBottom: "0.4rem",
              }}
            >
              Welcome back
            </h1>
            <p style={{ color: "#64748B", fontSize: "0.875rem" }}>
              Sign in to continue your study orbit
            </p>
          </div>

          <form onSubmit={onSubmit} noValidate>

            {/* Email */}
            <div style={{ marginBottom: "1rem" }}>
              <label
                htmlFor="email"
                style={{ display: "block", color: "#94A3B8", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.5rem", letterSpacing: "0.02em" }}
              >
                Email address
              </label>
              <div style={{ position: "relative" }}>
                <span
                  style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#475569", pointerEvents: "none" }}
                  aria-hidden="true"
                >
                  <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  style={{
                    width: "100%",
                    background: "rgba(15,23,42,0.6)",
                    border: "1px solid rgba(99,102,241,0.2)",
                    borderRadius: "10px",
                    padding: "0.75rem 0.875rem 0.75rem 2.75rem",
                    color: "#F1F5F9",
                    fontSize: "0.9rem",
                    outline: "none",
                    boxSizing: "border-box",
                    transition: "border-color 0.15s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(99,102,241,0.6)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(99,102,241,0.2)")}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: "0.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <label
                  htmlFor="password"
                  style={{ color: "#94A3B8", fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.02em" }}
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  style={{ color: "#6366F1", fontSize: "0.78rem", fontWeight: 500, textDecoration: "none" }}
                >
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: "relative" }}>
                <span
                  style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#475569", pointerEvents: "none" }}
                  aria-hidden="true"
                >
                  <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  style={{
                    width: "100%",
                    background: "rgba(15,23,42,0.6)",
                    border: "1px solid rgba(99,102,241,0.2)",
                    borderRadius: "10px",
                    padding: "0.75rem 2.75rem 0.75rem 2.75rem",
                    color: "#F1F5F9",
                    fontSize: "0.9rem",
                    outline: "none",
                    boxSizing: "border-box",
                    transition: "border-color 0.15s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(99,102,241,0.6)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(99,102,241,0.2)")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "#475569",
                    cursor: "pointer",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {errorMessage && (
              <div
                role="alert"
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.25)",
                  borderRadius: "8px",
                  padding: "0.65rem 0.875rem",
                  marginTop: "1rem",
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" width="15" height="15" style={{ flexShrink: 0, marginTop: "1px" }} aria-hidden="true">
                  <circle cx="12" cy="12" r="10" stroke="#EF4444" strokeWidth="1.8" />
                  <line x1="12" y1="8" x2="12" y2="12" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round" />
                  <line x1="12" y1="16" x2="12.01" y2="16" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <p style={{ color: "#FCA5A5", fontSize: "0.82rem", lineHeight: 1.45 }}>{errorMessage}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: "100%",
                marginTop: "1.5rem",
                background: isSubmitting
                  ? "rgba(99,102,241,0.5)"
                  : "linear-gradient(135deg,#6366F1,#8B5CF6)",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                padding: "0.85rem",
                fontWeight: 700,
                fontSize: "0.95rem",
                letterSpacing: "-0.01em",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                boxShadow: isSubmitting ? "none" : "0 0 24px rgba(99,102,241,0.35)",
                transition: "opacity 0.15s, box-shadow 0.15s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              {isSubmitting && (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  width="16"
                  height="16"
                  aria-hidden="true"
                  style={{ animation: "spin 0.8s linear infinite" }}
                >
                  <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                  <circle cx="12" cy="12" r="10" stroke="white" strokeOpacity="0.25" strokeWidth="2.5" />
                  <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              )}
              {isSubmitting ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        {/* Footer link */}
        <p style={{ textAlign: "center", marginTop: "1.5rem", color: "#475569", fontSize: "0.875rem" }}>
          Don't have an account?{" "}
          <Link
            href="/sign-up"
            style={{ color: "#A78BFA", fontWeight: 600, textDecoration: "none" }}
          >
            Create one free →
          </Link>
        </p>
      </div>
    </div>
  );
}