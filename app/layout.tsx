import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/providers/AuthProvider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://learningorbit.in"),
  title: {
    default: "LearningOrbit — AI-Powered Exam Prep for JEE, NEET, GATE & More",
    template: "%s · LearningOrbit",
  },
  description:
    "Personalised AI roadmaps, session tracking, and smart analytics for Indian competitive exams. Ace JEE, NEET, GATE, UPSC, CAT, CA & CLAT with LearningOrbit.",
  keywords: [
    "JEE preparation",
    "NEET study plan",
    "GATE exam preparation",
    "UPSC roadmap",
    "CAT preparation",
    "CA study plan",
    "CLAT preparation",
    "AI study planner India",
    "competitive exam tracker",
    "LearningOrbit",
  ],
  authors: [{ name: "LearningOrbit", url: "https://learningorbit.in" }],
  creator: "LearningOrbit",
  publisher: "LearningOrbit",
  category: "Education",
  openGraph: {
    type: "website",
    url: "https://learningorbit.in",
    siteName: "LearningOrbit",
    title: "LearningOrbit — AI Study Roadmaps for JEE, NEET, GATE & More",
    description:
      "Build a personalised, AI-generated study roadmap for any Indian competitive exam. Track sessions, analyse progress, and stay on target.",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "LearningOrbit — AI-Powered Exam Prep",
    description:
      "Personalised AI roadmaps for JEE, NEET, GATE, UPSC, CAT, CA & CLAT.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://learningorbit.in",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body style={{ fontFamily: "var(--font-inter), 'Segoe UI', system-ui, sans-serif" }}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}