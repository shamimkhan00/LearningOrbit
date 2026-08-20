

import Link from "next/link";
import { NavActions } from "@/app/components/NavActions";
import Image from 'next/image';
import logoIcon from './icon0.svg';

const EXAMS = [
  { name: "JEE", detail: "Mains & Advanced" },
  { name: "NEET", detail: "UG" },
  { name: "GATE", detail: "All branches" },
  { name: "UPSC", detail: "CSE" },
  { name: "CAT", detail: "MBA" },
  { name: "CA", detail: "Foundation · Inter · Final" },
  { name: "CLAT", detail: "UG & PG" },
];

const FEATURES = [
  {
    title: "AI Roadmap Generation",
    desc: "Get a chapter-by-chapter, topic-by-topic study plan built by AI and tuned to your exam date.",
    icon: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  },
  {
    title: "Session Tracking",
    desc: "Log every study session. Your daily streak, weekly hours, and heatmap stay in sync automatically.",
    icon: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 6v6l4 2",
  },
  {
    title: "Smart Analytics",
    desc: "Subject-wise progress rings, weak-area alerts, and velocity graphs keep you honest.",
    icon: "M18 20V10M12 20V4M6 20v-6",
  },
  {
    title: "Quick Topic Complete",
    desc: "Mark topics done with one tap. Undo mistakes instantly. Progress updates live across all devices.",
    icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    title: "AI Coach Insights",
    desc: "Daily nudges from your AI coach — what to revise, when to slow down, and how to pace to your goal.",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
  },
  {
    title: "7 Exams Supported",
    desc: "Full syllabus coverage for JEE, NEET, GATE (all branches), UPSC, CAT, CA, and CLAT.",
    icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  },
];

const STATS = [
  { value: "7", label: "Exams covered" },
  { value: "500+", label: "Topics mapped" },
  { value: "AI", label: "Powered roadmaps" },
  { value: "∞", label: "Study sessions" },
];

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "LearningOrbit",
            url: "https://learningorbit.in",
            description:
              "AI-powered exam preparation platform for JEE, NEET, GATE, UPSC, CAT, CA, and CLAT.",
            applicationCategory: "EducationalApplication",
            operatingSystem: "All",
            offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
            inLanguage: "en-IN",
          }),
        }}
      />

      <div style={{ background: "#0F172A", color: "#E2E8F0", minHeight: "100vh" }}>

        {/* ── NAV ── */}
        <header
          style={{
            borderBottom: "1px solid rgba(99,102,241,0.15)",
            background: "rgba(15,23,42,0.85)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            position: "sticky",
            top: 0,
            zIndex: 50,
          }}
        >
          <nav
            className="mx-auto flex items-center justify-between px-5 py-4 max-w-6xl"
            aria-label="Main navigation"
          >
            <Link href="/" aria-label="LearningOrbit home" className="flex items-center gap-2.5">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <Image
                  src={logoIcon}
                  alt="LearningOrbit Logo"
                  width={32}
                  height={32}
                  priority
                />
               
              </span>
              <span style={{ fontWeight: 700, fontSize: "1.05rem", letterSpacing: "-0.02em", color: "#F8FAFC" }}>
                LearningOrbit
              </span>
            </Link>

            {/* ← only this component is a client island */}
            <NavActions />
          </nav>
        </header>

        <main id="main-content">

          {/* ── HERO ── */}
          <section
            style={{
              minHeight: "calc(100vh - 65px)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: "5rem 1.25rem",
              position: "relative",
              overflow: "hidden",
            }}
            aria-labelledby="hero-heading"
          >
            <svg
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
              viewBox="0 0 900 600"
              preserveAspectRatio="xMidYMid slice"
              aria-hidden="true"
            >
              <defs>
                <radialGradient id="glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#6366F1" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#0F172A" stopOpacity="0" />
                </radialGradient>
                <style>{`
                  @keyframes orbitSpin { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }
                  .od{transform-box:fill-box;transform-origin:center}
                  .od1{animation:orbitSpin 18s linear infinite}
                  .od2{animation:orbitSpin 12s linear infinite reverse}
                  .od3{animation:orbitSpin 8s linear infinite}
                  @media(prefers-reduced-motion:reduce){.od1,.od2,.od3{animation:none}}
                `}</style>
              </defs>
              <circle r="380" cx="450" cy="300" fill="none" stroke="#6366F1" strokeOpacity="0.1" strokeWidth="1" />
              <circle r="260" cx="450" cy="300" fill="none" stroke="#8B5CF6" strokeOpacity="0.1" strokeWidth="1" />
              <circle r="160" cx="450" cy="300" fill="none" stroke="#A78BFA" strokeOpacity="0.12" strokeWidth="1" />
              <g className="od od1"><circle r="5" cx="830" cy="300" fill="#6366F1" fillOpacity="0.8" /></g>
              <g className="od od2"><circle r="3.5" cx="710" cy="300" fill="#8B5CF6" fillOpacity="0.9" /></g>
              <g className="od od3"><circle r="3" cx="610" cy="300" fill="#A78BFA" fillOpacity="0.9" /></g>
              <circle r="200" cx="450" cy="300" fill="url(#glow)" />
            </svg>

            <div style={{ position: "relative", zIndex: 10, maxWidth: "720px", margin: "0 auto" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "rgba(99,102,241,0.12)",
                  border: "1px solid rgba(99,102,241,0.3)",
                  borderRadius: "100px",
                  padding: "0.35rem 1rem",
                  marginBottom: "1.75rem",
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#6366F1", display: "inline-block" }} />
                <span style={{ color: "#A78BFA", fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  JEE · NEET · GATE · UPSC · CAT · CA · CLAT
                </span>
              </div>

              <h1
                id="hero-heading"
                style={{
                  fontSize: "clamp(2.4rem, 6vw, 4rem)",
                  fontWeight: 800,
                  lineHeight: 1.1,
                  letterSpacing: "-0.035em",
                  color: "#F8FAFC",
                  marginBottom: "1.5rem",
                }}
              >
                Your AI study partner{" "}
                <span
                  style={{
                    background: "linear-gradient(135deg,#6366F1 0%,#A78BFA 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  for every exam
                </span>{" "}
                that matters
              </h1>

              <p
                style={{
                  fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
                  color: "#94A3B8",
                  lineHeight: 1.65,
                  maxWidth: "560px",
                  margin: "0 auto 2.5rem",
                }}
              >
                LearningOrbit generates a personalised, topic-by-topic roadmap for JEE, NEET,
                GATE, UPSC, CAT, CA, and CLAT — then tracks every hour you study, right to exam day.
              </p>

              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
                <Link
                  href="/sign-up"
                  style={{
                    background: "linear-gradient(135deg,#6366F1,#8B5CF6)",
                    color: "#fff",
                    borderRadius: "10px",
                    fontWeight: 700,
                    fontSize: "1rem",
                    padding: "0.85rem 2rem",
                    boxShadow: "0 0 30px rgba(99,102,241,0.35)",
                    letterSpacing: "-0.01em",
                    textDecoration: "none",
                    display: "inline-block",
                  }}
                >
                  Build my roadmap — free
                </Link>
                <Link
                  href="/sign-in"
                  style={{
                    background: "rgba(99,102,241,0.1)",
                    color: "#A78BFA",
                    border: "1px solid rgba(99,102,241,0.3)",
                    borderRadius: "10px",
                    fontWeight: 600,
                    fontSize: "1rem",
                    padding: "0.85rem 1.75rem",
                    textDecoration: "none",
                    display: "inline-block",
                  }}
                >
                  Sign in
                </Link>
              </div>

              <p style={{ color: "#475569", fontSize: "0.78rem", marginTop: "1.5rem", letterSpacing: "0.02em" }}>
                No credit card · Works on mobile · Starts in 60 seconds
              </p>
            </div>
          </section>

          {/* ── STATS ── */}
          <section
            style={{
              borderTop: "1px solid rgba(99,102,241,0.12)",
              borderBottom: "1px solid rgba(99,102,241,0.12)",
              background: "rgba(30,41,59,0.5)",
            }}
            aria-label="Platform statistics"
          >
            <div className="mx-auto max-w-4xl grid grid-cols-2 sm:grid-cols-4">
              {STATS.map(({ value, label }) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "2rem 1rem",
                    gap: "4px",
                    borderRight: "1px solid rgba(99,102,241,0.1)",
                  }}
                >
                  <span
                    style={{
                      fontSize: "clamp(1.8rem, 4vw, 2.4rem)",
                      fontWeight: 800,
                      letterSpacing: "-0.04em",
                      background: "linear-gradient(135deg,#6366F1,#A78BFA)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {value}
                  </span>
                  <span style={{ color: "#64748B", fontSize: "0.8rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* ── FEATURES ── */}
          <section className="mx-auto max-w-6xl px-5 py-20" aria-labelledby="features-heading">
            <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
              <p style={{ color: "#6366F1", fontWeight: 600, fontSize: "0.8rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                Everything you need
              </p>
              <h2
                id="features-heading"
                style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 800, letterSpacing: "-0.03em", color: "#F8FAFC", lineHeight: 1.15 }}
              >
                Study smarter, not harder
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {FEATURES.map(({ title, desc, icon }) => (
                <article
                  key={title}
                  style={{
                    background: "rgba(30,41,59,0.6)",
                    border: "1px solid rgba(99,102,241,0.15)",
                    borderRadius: "14px",
                    padding: "1.6rem",
                  }}
                >
                  <div
                    style={{
                      background: "linear-gradient(135deg,rgba(99,102,241,0.2),rgba(139,92,246,0.2))",
                      borderRadius: "10px",
                      width: "44px",
                      height: "44px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "1rem",
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" width="22" height="22" aria-hidden="true">
                      <path d={icon} stroke="#A78BFA" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h3 style={{ color: "#F1F5F9", fontWeight: 700, fontSize: "1rem", marginBottom: "0.5rem", letterSpacing: "-0.01em" }}>
                    {title}
                  </h3>
                  <p style={{ color: "#64748B", fontSize: "0.875rem", lineHeight: 1.65 }}>{desc}</p>
                </article>
              ))}
            </div>
          </section>

          {/* ── EXAMS ── */}
          <section
            style={{
              background: "rgba(99,102,241,0.05)",
              borderTop: "1px solid rgba(99,102,241,0.12)",
              borderBottom: "1px solid rgba(99,102,241,0.12)",
              padding: "4rem 1.25rem",
              textAlign: "center",
            }}
            aria-labelledby="exams-heading"
          >
            <div className="mx-auto max-w-4xl">
              <h2
                id="exams-heading"
                style={{ color: "#F8FAFC", fontWeight: 800, fontSize: "clamp(1.5rem,3.5vw,2rem)", letterSpacing: "-0.03em", marginBottom: "0.75rem" }}
              >
                Built for India's toughest exams
              </h2>
              <p style={{ color: "#64748B", fontSize: "0.9rem", marginBottom: "2.5rem" }}>
                Full syllabus coverage, AI-generated topics, and daily pacing — all in one place.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", justifyContent: "center" }} role="list" aria-label="Supported exams">
                {EXAMS.map(({ name, detail }) => (
                  <div
                    key={name}
                    role="listitem"
                    style={{
                      background: "rgba(30,41,59,0.8)",
                      border: "1px solid rgba(99,102,241,0.2)",
                      borderRadius: "10px",
                      padding: "0.7rem 1.2rem",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      minWidth: "90px",
                    }}
                  >
                    <span style={{ color: "#A78BFA", fontWeight: 800, fontSize: "1.05rem", letterSpacing: "-0.02em" }}>{name}</span>
                    <span style={{ color: "#475569", fontSize: "0.7rem", marginTop: "2px" }}>{detail}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── FINAL CTA ── */}
          <section style={{ padding: "6rem 1.25rem", textAlign: "center" }} aria-labelledby="cta-heading">
            <div className="mx-auto max-w-2xl">
              <h2
                id="cta-heading"
                style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 800, letterSpacing: "-0.035em", color: "#F8FAFC", lineHeight: 1.15, marginBottom: "1.2rem" }}
              >
                Start your orbit today.{" "}
                <span
                  style={{
                    background: "linear-gradient(135deg,#6366F1,#A78BFA)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Your exam won't wait.
                </span>
              </h2>
              <p style={{ color: "#64748B", fontSize: "1rem", marginBottom: "2rem", lineHeight: 1.65 }}>
                Build your free AI roadmap in under a minute — no tutor needed, no rigid schedule, just a plan that moves with you.
              </p>
              <Link
                href="/sign-up"
                style={{
                  display: "inline-block",
                  background: "linear-gradient(135deg,#6366F1,#8B5CF6)",
                  color: "#fff",
                  borderRadius: "10px",
                  fontWeight: 700,
                  fontSize: "1.05rem",
                  padding: "0.9rem 2.4rem",
                  boxShadow: "0 0 40px rgba(99,102,241,0.4)",
                  letterSpacing: "-0.01em",
                  textDecoration: "none",
                }}
              >
                Create free account →
              </Link>
            </div>
          </section>
        </main>

        {/* ── FOOTER ── */}
        <footer style={{ borderTop: "1px solid rgba(99,102,241,0.12)", padding: "2rem 1.25rem" }} role="contentinfo">
          <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", width: "22px", height: "22px" }}>
                <svg viewBox="0 0 24 24" fill="none" width="12" height="12" aria-hidden="true">
                  <circle cx="12" cy="12" r="3" fill="white" />
                  <ellipse cx="12" cy="12" rx="10" ry="4.5" stroke="white" strokeWidth="1.8" fill="none" />
                  <ellipse cx="12" cy="12" rx="10" ry="4.5" stroke="white" strokeWidth="1.8" fill="none" transform="rotate(60 12 12)" />
                </svg>
              </span>
              <span style={{ color: "#475569", fontSize: "0.85rem", fontWeight: 600 }}>LearningOrbit</span>
            </div>
            <p style={{ color: "#334155", fontSize: "0.78rem" }}>
              © {new Date().getFullYear()} LearningOrbit · learningorbit.in · Built for Indian students
            </p>
            <nav aria-label="Footer navigation" style={{ display: "flex", gap: "1.25rem" }}>
              {[["Privacy", "/privacy-policy"], ["Terms", "/terms-and-conditions"], ["Contact", "/contact"]].map(([label, href]) => (
                <Link key={label} href={href} style={{ color: "#475569", fontSize: "0.8rem", textDecoration: "none" }}>
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </footer>
      </div>
    </>
  );
}