import nodemailer from "nodemailer";

/**
 * Create SES SMTP transporter for a mailbox
 */
export const createSESTransporter = (smtpUser, smtpPass) => {
  if (!smtpUser || !smtpPass) {
    throw new Error("SES SMTP credentials missing");
  }

  return nodemailer.createTransport({
    host: process.env.SES_HOST, // email-smtp.region.amazonaws.com
    port: Number(process.env.SES_PORT) || 587,
    secure: false, // STARTTLS
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    tls: {
      rejectUnauthorized: false, // optional during dev
    },
  });
};
