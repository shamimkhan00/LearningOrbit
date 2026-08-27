import "server-only";

import nodemailer from "nodemailer";

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT ?? 587);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS?.replace(/\s+/g, "");
const smtpFrom = process.env.SMTP_FROM ?? smtpUser;

function getTransporter() {
  if (!smtpHost || !smtpUser || !smtpPass || !smtpFrom) {
    throw new Error(
      "SMTP environment variables are missing. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM.",
    );
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
}

function formatMailerError(error: unknown) {
  if (error && typeof error === "object") {
    const typedError = error as {
      code?: string;
      response?: string;
      responseCode?: number;
      command?: string;
      message?: string;
    };

    const parts = [
      typedError.code,
      typedError.command,
      typedError.responseCode ? String(typedError.responseCode) : "",
      typedError.response,
      typedError.message,
    ].filter(Boolean);

    return parts.join(" | ");
  }

  return error instanceof Error ? error.message : String(error);
}

export async function sendSignupOtpEmail(email: string, code: string) {
  const transporter = getTransporter();

  try {
    await transporter.verify();

    await transporter.sendMail({
      from: smtpFrom,
      to: email,
      subject: "Your LearningOrbit signup code",
      text: `Your LearningOrbit signup OTP is ${code}. It expires in 10 minutes.`,
      html: `<div style="font-family:Arial,sans-serif;line-height:1.6"><h2>LearningOrbit Signup OTP</h2><p>Your one-time code is:</p><p style="font-size:32px;font-weight:700;letter-spacing:6px">${code}</p><p>This code expires in 10 minutes.</p></div>`,
    });
  } catch (error) {
    throw new Error(`SMTP send failed: ${formatMailerError(error)}`);
  }
}
