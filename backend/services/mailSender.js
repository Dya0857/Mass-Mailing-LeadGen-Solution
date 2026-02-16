import { createSESTransporter } from "./sesTransporter.js";

/**
 * Send email using a specific mailbox via SES SMTP
 */
export const sendMailFromMailbox = async ({
  mailbox,
  to,
  subject,
  html,
  senderName = "MailMaster",
}) => {
  if (!mailbox) {
    throw new Error("Mailbox not provided");
  }

  if (!mailbox.smtpUser || !mailbox.smtpPass) {
    throw new Error(`SMTP credentials missing for ${mailbox.email}`);
  }

  const transporter = createSESTransporter(
    mailbox.smtpUser,
    mailbox.smtpPass
  );

  try {
    const info = await transporter.sendMail({
      from: `"${senderName}" <${mailbox.email}>`,
      to,
      subject,
      html,
    });

    console.log(`📤 ${mailbox.email} → ${to}`);

    return info;
  } catch (error) {
    console.error(`❌ SES send failed from ${mailbox.email}:`, error.message);
    throw error;
  }
};
