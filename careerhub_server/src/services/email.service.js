// email.service.js — Nodemailer version
import nodemailer from "nodemailer";
import Mailgen from "mailgen";

const sendEmail = async (options) => {
  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: process.env.EMAIL_FROM_NAME || "CareerHub",
      link: process.env.CLIENT_URL,
    },
  });

  const emailHtml = mailGenerator.generate(options.mailgenContent);
  const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent);

  // Create transporter using your Gmail App Password from .env
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,       // sahumanassssss@gmail.com
      pass: process.env.EMAIL_PASSWORD,   // ghkocjldwelceybm (App Password)
    },
  });

  // No try/catch — errors bubble up naturally
  await transporter.sendMail({
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: emailHtml,
    text: emailTextual,
  });

  console.log(`📧 Email sent to ${options.email}`);
};