import Mailgen from "mailgen";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (options) => {
  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: process.env.EMAIL_FROM_NAME || "CareerHub",
      link: process.env.CLIENT_URL || "https://carrer-hub-omega.vercel.app",
    },
  });

  const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent);
  const emailHtml = mailGenerator.generate(options.mailgenContent);

  try {
    await resend.emails.send({
      from: "CareerHub <onboarding@resend.dev>",
      to: options.email,
      subject: options.subject,
      html: emailHtml,
      text: emailTextual,
    });
    console.log(`📧 Email sent to ${options.email} — "${options.subject}"`);
  } catch (error) {
    console.error("❌ Email service failed:", error.message);
  }
};

const emailVerificationMailgenContent = (username, verificationUrl) => ({
  body: {
    name: username,
    intro: "Welcome to CareerHub! We're excited to have you on board.",
    action: {
      instructions: "To verify your email address, please click the button below:",
      button: {
        color: "#4f46e5",
        text: "Verify your email",
        link: verificationUrl,
      },
    },
    outro: "If you did not create an account, you can safely ignore this email.",
  },
});

const forgotPasswordMailgenContent = (username, passwordResetURL) => ({
  body: {
    name: username,
    intro: "We received a request to reset your CareerHub password.",
    action: {
      instructions: "Click the button below to reset your password. This link expires in 20 minutes.",
      button: {
        color: "#4f46e5",
        text: "Reset your password",
        link: passwordResetURL,
      },
    },
    outro: "If you did not request a password reset, please ignore this email.",
  },
});

export { sendEmail, emailVerificationMailgenContent, forgotPasswordMailgenContent };