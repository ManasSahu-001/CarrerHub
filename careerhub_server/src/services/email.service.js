import nodemailer from "nodemailer";
import Mailgen from "mailgen";

const sendEmail = async (options) => {
  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: process.env.EMAIL_FROM_NAME || "CareerHub",
      link: process.env.CLIENT_URL || "http://localhost:3000",
    },
  });

  const emailHtml = mailGenerator.generate(options.mailgenContent);
  const emailText = mailGenerator.generatePlaintext(options.mailgenContent);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD, // App password, not your Gmail password
    },
  });

  try {
    await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      html: emailHtml,
      text: emailText,
    });
    console.log(`📧 Email sent to ${options.email} — "${options.subject}"`);
  } catch (error) {
    console.error("❌ Email service failed:", error.message);
  }
};