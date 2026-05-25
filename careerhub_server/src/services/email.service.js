/**
 * Email Service — uses Gmail SMTP (real emails) via nodemailer + Mailgen templates.
 *
 * Required .env vars:
 *   EMAIL_USER      — your Gmail address  (e.g. yourapp@gmail.com)
 *   EMAIL_PASSWORD  — Gmail App Password  (generate at https://myaccount.google.com/apppasswords)
 *                     NOTE: use an App Password, NOT your normal Gmail password.
 *   EMAIL_FROM_NAME — display name shown in From field (e.g. "Prolink")
 */

import Mailgen from "mailgen";
import nodemailer from "nodemailer";

// ---------------------------------------------------------------------------
// Transporter — Gmail SMTP (replaces Mailtrap sandbox)
// ---------------------------------------------------------------------------
const createTransporter = () =>
  nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD, // App Password, not Google account password
    },
  });

// ---------------------------------------------------------------------------
// Core send function
// ---------------------------------------------------------------------------
const sendEmail = async (options) => {
  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: process.env.EMAIL_FROM_NAME || "Prolink",
      link: process.env.CLIENT_URL || "https://yourapp.com",
    },
  });

  const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent);
  const emailHtml = mailGenerator.generate(options.mailgenContent);

  const transporter = createTransporter();

  const mail = {
    from: `"${process.env.EMAIL_FROM_NAME || "Prolink"}" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: emailTextual,
    html: emailHtml,
  };

  try {
    await transporter.sendMail(mail);
    console.log(`📧 Email sent to ${options.email} — "${options.subject}"`);
  } catch (error) {
    // Fail silently so email errors never crash the API
    console.error("❌ Email service failed:", error.message);
  }
};

// ---------------------------------------------------------------------------
// Email content templates
// ---------------------------------------------------------------------------

/**
 * Verification email sent after registration.
 * @param {string} username
 * @param {string} verificationUrl
 */
const emailVerificationMailgenContent = (username, verificationUrl) => ({
  body: {
    name: username,
    intro: "Welcome to Prolink! We're excited to have you on board.",
    action: {
      instructions:
        "To verify your email address, please click the button below:",
      button: {
        color: "#22BC66",
        text: "Verify your email",
        link: verificationUrl,
      },
    },
    outro:
      "If you did not create an account, you can safely ignore this email.",
  },
});

/**
 * Password reset email.
 * @param {string} username
 * @param {string} passwordResetURL
 */
const forgotPasswordMailgenContent = (username, passwordResetURL) => ({
  body: {
    name: username,
    intro: "We received a request to reset your Prolink password.",
    action: {
      instructions:
        "Click the button below to reset your password. This link expires in 20 minutes.",
      button: {
        color: "#FF6B35",
        text: "Reset your password",
        link: passwordResetURL,
      },
    },
    outro:
      "If you did not request a password reset, please ignore this email — your password will remain unchanged.",
  },
});

export { sendEmail, emailVerificationMailgenContent, forgotPasswordMailgenContent };
