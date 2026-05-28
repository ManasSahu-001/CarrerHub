import nodemailer from "nodemailer";
import Mailgen from "mailgen";

export const emailVerificationMailgenContent = (
  username,
  verificationUrl
) => {
  return {
    body: {
      name: username,
      intro: "Welcome to CareerHub! We're very excited to have you on board.",
      action: {
        instructions: "To get started with CareerHub, please click here:",
        button: {
          color: "#22BC66",
          text: "Verify your email",
          link: verificationUrl,
        },
      },
      outro: "Need help? Just reply to this email.",
    },
  };
};

export const forgotPasswordMailgenContent = (
  username,
  resetUrl
) => {
  return {
    body: {
      name: username,
      intro: "We received a request to reset your password.",
      action: {
        instructions: "Click the button below to reset your password:",
        button: {
          color: "#DC4D2F",
          text: "Reset Password",
          link: resetUrl,
        },
      },
      outro: "If you did not request this, please ignore this email.",
    },
  };
};

export const sendEmail = async (options) => {
  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: process.env.EMAIL_FROM_NAME || "CareerHub",
      link: process.env.CLIENT_URL,
    },
  });

  const emailHtml = mailGenerator.generate(options.mailgenContent);
  const emailTextual = mailGenerator.generatePlaintext(
    options.mailgenContent
  );

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: emailHtml,
    text: emailTextual,
  });

  console.log(`📧 Email sent to ${options.email}`);
};