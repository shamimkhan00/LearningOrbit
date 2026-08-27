import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | LearningOrbit",
  description: "Get in touch with the LearningOrbit team for support, feedback, or general queries.",
};

export default function ContactPage() {
  const contactItems = [
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      ),
      label: "Email",
      value: "support@learningorbit.in",
      href: "mailto:support@learningorbit.in",
      description: "Best for general queries, support, and feedback. We aim to reply within 24 hours.",
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      ),
      label: "Instagram",
      value: "@learning_orbit_",
      href: "https://instagram.com/learning_orbit_",
      description: "Follow us for exam tips, study motivation, and platform updates.",
    },
  ];

  const faqItems = [
    {
      q: "How do I reset my study roadmap?",
      a: "Go to your Dashboard and use the 'Regenerate Roadmap' option. This will create a fresh AI-generated plan based on your current exam and timeline.",
    },
    {
      q: "Is LearningOrbit free to use?",
      a: "Yes — LearningOrbit is currently free for all students. We may introduce premium features in the future, but the core roadmap tool will remain accessible.",
    },
    {
      q: "Which exams are supported?",
      a: "We currently support JEE, NEET, GATE, UPSC, CAT, CA, and CLAT. More exams will be added soon.",
    },
    {
      q: "How accurate are the AI-generated roadmaps?",
      a: "Our AI uses the latest official syllabi for each exam. We recommend cross-checking with the official exam notification for the most up-to-date information.",
    },
  ];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0F172A", color: "#F8FAFC" }}>
      {/* Scoped hover styles */}
      <style>{`
        .contact-card {
          display: flex;
          align-items: flex-start;
          gap: 20px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(99, 102, 241, 0.15);
          border-radius: 16px;
          padding: 24px;
          text-decoration: none;
          transition: border-color 0.2s, background 0.2s;
        }
        .contact-card:hover {
          border-color: rgba(99, 102, 241, 0.4);
          background: rgba(99, 102, 241, 0.06);
        }
      `}</style>

      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #0F172A 0%, #1A1035 50%, #0F172A 100%)",
          borderBottom: "1px solid rgba(99,102,241,0.15)",
          padding: "60px 24px 48px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Orbit rings */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "340px",
            height: "130px",
            border: "1px solid rgba(99,102,241,0.08)",
            borderRadius: "50%",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "520px",
            height: "190px",
            border: "1px solid rgba(139,92,246,0.05)",
            borderRadius: "50%",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(99,102,241,0.1)",
              border: "1px solid rgba(99,102,241,0.25)",
              borderRadius: "20px",
              padding: "6px 16px",
              marginBottom: "20px",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
            <span style={{ color: "#A78BFA", fontSize: "13px", fontWeight: 500 }}>Get in Touch</span>
          </div>

          <h1
            style={{
              fontSize: "clamp(28px, 5vw, 42px)",
              fontWeight: 700,
              margin: "0 0 16px",
              background: "linear-gradient(135deg, #F8FAFC 0%, #A78BFA 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Contact Us
          </h1>
          <p
            style={{
              color: "#94A3B8",
              fontSize: "clamp(14px, 2.5vw, 16px)",
              margin: 0,
              maxWidth: "400px",
              marginLeft: "auto",
              marginRight: "auto",
              lineHeight: 1.6,
            }}
          >
            Have a question, suggestion, or just want to say hi? We'd love to hear from you.
          </p>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* Contact cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "56px" }}>
          {contactItems.map((item, idx) => (
            <a
              key={idx}
              href={item.href}
              target={item.href.startsWith("http") ? "_blank" : undefined}
              rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="contact-card"
            >
              {/* Icon */}
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "14px",
                  background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))",
                  border: "1px solid rgba(99,102,241,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#A78BFA",
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </div>

              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
                  <span style={{ color: "#64748B", fontSize: "12px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    {item.label}
                  </span>
                </div>
                <p
                  style={{
                    color: "#C4B5FD",
                    fontSize: "16px",
                    fontWeight: 600,
                    margin: "0 0 6px",
                    wordBreak: "break-all",
                  }}
                >
                  {item.value}
                </p>
                <p style={{ color: "#64748B", fontSize: "13px", margin: 0, lineHeight: 1.5 }}>
                  {item.description}
                </p>
              </div>

              {/* Arrow */}
              <div style={{ color: "#475569", flexShrink: 0, marginTop: "4px" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" />
                </svg>
              </div>
            </a>
          ))}
        </div>

        {/* Divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "48px",
          }}
        >
          <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" }} />
          <span style={{ color: "#334155", fontSize: "13px", whiteSpace: "nowrap" }}>Frequently Asked</span>
          <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" }} />
        </div>

        {/* FAQ */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "56px" }}>
          {faqItems.map((item, idx) => (
            <div
              key={idx}
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "12px",
                padding: "20px",
              }}
            >
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <div
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "6px",
                    background: "rgba(99,102,241,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: "1px",
                  }}
                >
                  <span style={{ color: "#A78BFA", fontSize: "11px", fontWeight: 700 }}>Q</span>
                </div>
                <div>
                  <p style={{ color: "#E2E8F0", fontSize: "14px", fontWeight: 600, margin: "0 0 8px", lineHeight: 1.4 }}>
                    {item.q}
                  </p>
                  <p style={{ color: "#64748B", fontSize: "14px", margin: 0, lineHeight: 1.6 }}>
                    {item.a}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.08))",
            border: "1px solid rgba(99,102,241,0.2)",
            borderRadius: "16px",
            padding: "32px 24px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
          </div>
          <h3 style={{ color: "#F8FAFC", fontSize: "18px", fontWeight: 600, margin: "0 0 8px" }}>
            Built by students, for students
          </h3>
          <p style={{ color: "#64748B", fontSize: "14px", margin: "0 0 20px", lineHeight: 1.6 }}>
            LearningOrbit is a passion project aimed at making quality exam prep accessible to every student in India. Your feedback genuinely shapes the platform.
          </p>
          <a
            href="mailto:support@learningorbit.in"
            style={{
              display: "inline-block",
              background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
              color: "#fff",
              padding: "12px 28px",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: 600,
              textDecoration: "none",
              letterSpacing: "0.01em",
            }}
          >
            Send us a message
          </a>
        </div>
      </div>
    </div>
  );
}