import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | LearningOrbit",
  description: "Learn how LearningOrbit collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  const lastUpdated = "August 20, 2026";

  const sections = [
    {
      id: "information-we-collect",
      title: "Information We Collect",
      content: [
        {
          subtitle: "Account Information",
          text: "When you create an account, we collect your name, email address, and the exam you're preparing for. This is used solely to personalise your study roadmap and track your progress.",
        },
        {
          subtitle: "Usage Data",
          text: "We collect information about how you interact with the platform — topics marked complete, time spent studying, and roadmap generation requests. This helps us improve recommendations and AI accuracy.",
        },
        {
          subtitle: "Device & Technical Data",
          text: "We automatically receive basic technical information such as your browser type, device type, and IP address. This is used for security monitoring and platform diagnostics only.",
        },
      ],
    },
    {
      id: "how-we-use",
      title: "How We Use Your Information",
      content: [
        {
          subtitle: "AI Roadmap Generation",
          text: "Your exam selection and study preferences are sent to our AI engine (powered by Groq) to generate a personalised topic-level study roadmap. We do not sell this data to third parties.",
        },
        {
          subtitle: "Progress Tracking",
          text: "Your completed topics and session history are stored securely in Firestore to maintain continuity across devices and sessions.",
        },
        {
          subtitle: "Platform Improvement",
          text: "Aggregated, anonymised usage patterns help us improve topic coverage, AI accuracy, and the overall learning experience.",
        },
      ],
    },
    {
      id: "data-storage",
      title: "Data Storage & Security",
      content: [
        {
          subtitle: "Firebase Infrastructure",
          text: "All user data is stored on Google Firebase (Firestore), which complies with ISO 27001, SOC 1, SOC 2, and SOC 3 standards. Data is encrypted in transit (TLS) and at rest.",
        },
        {
          subtitle: "Data Retention",
          text: "Your account data is retained as long as your account is active. You may request deletion of your account and all associated data at any time by contacting us.",
        },
        {
          subtitle: "Access Control",
          text: "Only you can access your personal roadmap and progress data. LearningOrbit staff do not access individual user data except to resolve technical issues at your explicit request.",
        },
      ],
    },
    {
      id: "third-parties",
      title: "Third-Party Services",
      content: [
        {
          subtitle: "Groq AI",
          text: "Roadmap generation prompts are processed by Groq's API. Prompts include your exam type and study preferences but not personally identifiable information like your name or email.",
        },
        {
          subtitle: "Firebase by Google",
          text: "Authentication and database services are provided by Google Firebase. Google's data processing terms apply to this infrastructure layer.",
        },
        {
          subtitle: "Vercel",
          text: "Our platform is hosted on Vercel. Vercel may collect basic request logs for CDN and performance purposes.",
        },
      ],
    },
    {
      id: "your-rights",
      title: "Your Rights",
      content: [
        {
          subtitle: "Access & Portability",
          text: "You have the right to request a copy of all personal data we hold about you in a portable format.",
        },
        {
          subtitle: "Correction & Deletion",
          text: "You can update your profile at any time from your dashboard. To delete your account and all data permanently, contact us at the email below.",
        },
        {
          subtitle: "Opt-Out",
          text: "You may opt out of any non-essential communications at any time. Deleting your account opts you out of all future data processing by LearningOrbit.",
        },
      ],
    },
    {
      id: "cookies",
      title: "Cookies",
      content: [
        {
          subtitle: "Essential Cookies Only",
          text: "LearningOrbit uses only essential cookies required for authentication and session management. We do not use advertising, tracking, or analytics cookies.",
        },
      ],
    },
    {
      id: "changes",
      title: "Changes to This Policy",
      content: [
        {
          subtitle: "",
          text: "We may update this Privacy Policy from time to time. When we do, we will update the 'Last Updated' date at the top of this page and, for significant changes, notify you by email. Continued use of the platform after changes constitutes acceptance of the updated policy.",
        },
      ],
    },
  ];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0F172A", color: "#F8FAFC" }}>
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #0F172A 100%)",
          borderBottom: "1px solid rgba(99,102,241,0.15)",
          padding: "60px 24px 48px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle orbit decoration */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "320px",
            height: "120px",
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
            width: "500px",
            height: "180px",
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
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span style={{ color: "#A78BFA", fontSize: "13px", fontWeight: 500 }}>Legal</span>
          </div>
          <h1
            style={{
              fontSize: "clamp(28px, 5vw, 42px)",
              fontWeight: 700,
              margin: "0 0 12px",
              background: "linear-gradient(135deg, #F8FAFC 0%, #A78BFA 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Privacy Policy
          </h1>
          <p style={{ color: "#64748B", fontSize: "14px", margin: 0 }}>
            Last updated: {lastUpdated}
          </p>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "48px 24px 80px",
        }}
      >
        {/* Intro */}
        <div
          style={{
            background: "rgba(99,102,241,0.06)",
            border: "1px solid rgba(99,102,241,0.15)",
            borderRadius: "12px",
            padding: "24px",
            marginBottom: "48px",
          }}
        >
          <p style={{ color: "#94A3B8", lineHeight: 1.7, margin: 0, fontSize: "15px" }}>
            LearningOrbit is committed to protecting your privacy. This policy explains exactly what data we collect, why we collect it, and how it's used — in plain language. If you have questions, reach out at{" "}
            <a
              href="mailto:tutorai.official.dev@gmail.com"
              style={{ color: "#A78BFA", textDecoration: "none" }}
            >
              tutorai.official.dev@gmail.com
            </a>
            .
          </p>
        </div>

        {/* Sections */}
        {sections.map((section, idx) => (
          <div
            key={section.id}
            style={{
              marginBottom: "44px",
              paddingBottom: "44px",
              borderBottom: idx < sections.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "8px",
                  background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#fff",
                }}
              >
                {idx + 1}
              </div>
              <h2 style={{ fontSize: "20px", fontWeight: 600, margin: 0, color: "#F8FAFC" }}>
                {section.title}
              </h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {section.content.map((item, i) => (
                <div
                  key={i}
                  style={{
                    paddingLeft: "16px",
                    borderLeft: "2px solid rgba(99,102,241,0.3)",
                  }}
                >
                  {item.subtitle && (
                    <p style={{ color: "#C4B5FD", fontSize: "14px", fontWeight: 600, margin: "0 0 6px" }}>
                      {item.subtitle}
                    </p>
                  )}
                  <p style={{ color: "#94A3B8", lineHeight: 1.7, margin: 0, fontSize: "15px" }}>
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Contact CTA */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))",
            border: "1px solid rgba(99,102,241,0.2)",
            borderRadius: "16px",
            padding: "32px 24px",
            textAlign: "center",
          }}
        >
          <p style={{ color: "#94A3B8", fontSize: "15px", margin: "0 0 8px" }}>Questions about this policy?</p>
          <a
            href="mailto:tutorai.official.dev@gmail.com"
            style={{
              color: "#A78BFA",
              fontSize: "16px",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            tutorai.official.dev@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
}