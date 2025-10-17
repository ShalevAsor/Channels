/**
 * Email Service Configuration
 * Handles sending of authentication-related emails using Gmail SMTP
 */
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const domain = process.env.NEXT_PUBLIC_APP_URL;
const FROM_EMAIL = process.env.GMAIL_USER || "noreply@example.com";

/**
 * Sends a Two-Factor Authentication token via email
 *
 * @param email - Recipient's email address
 * @param token - The 2FA token to be sent
 */

export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
  await transporter.sendMail({
    from: FROM_EMAIL,
    to: email,
    subject: "2FA Code",
    html: `<p>Your 2FA code: ${token}</p>`,
  });
};
/**
 * Sends an email verification link
 *
 * @param email - Recipient's email address
 * @param token - Verification token for the confirmation link
 */
export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${domain}/auth/new-verification?token=${token}`;
  await transporter.sendMail({
    from: FROM_EMAIL,
    to: email,
    subject: "Confirm your email",
    html: `<p>Click <a href="${confirmLink}">here</a> to confirm email.</p>`,
  });
};
/**
 * Sends a password reset link
 *
 * @param email - Recipient's email address
 * @param token - Reset token for the password reset link
 */
export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${domain}/auth/new-password?token=${token}`;
  await transporter.sendMail({
    from: FROM_EMAIL,
    to: email,
    subject: "Reset your password",
    html: `<p>Click <a href="${resetLink}">here</a> to reset password.</p>`,
  });
};
