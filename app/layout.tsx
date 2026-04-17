import "./globals.css";

import { Anonymous_Pro, Fira_Mono } from "next/font/google";

const firaMono = Fira_Mono({
  weight: ["400", "500", "700"],
  style: ["normal"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fira-mono",
});

const anonymousPro = Anonymous_Pro({
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-anonymous-pro",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${firaMono.variable} ${anonymousPro.variable} flex max-w-screen-xl flex-col justify-between relative mx-auto mt-40 bg-black px-8 pb-40 text-white`}
      >
        {children}
      </body>
    </html>
  );
}
