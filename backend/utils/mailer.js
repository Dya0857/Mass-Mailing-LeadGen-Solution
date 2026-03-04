import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SES_HOST || "email-smtp.eu-north-1.amazonaws.com",
  port: parseInt(process.env.SES_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SES_SMTP_USER,
    pass: process.env.SES_SMTP_PASS,
  },
});

/**
 * Format content into styled HTML
 */
const formatEmailContent = (content) => {
  let formatted = content.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
  formatted = formatted.replace(/\r?\n/g, "<br/>");

  return `
    <div style="font-family: Arial; max-width:600px; margin:auto;">
      ${formatted}
    </div>
  `;
};

/**
 * Send email via AWS SES
 */
const sendMail = async (to, subject, content, options = {}) => {
  const { senderEmail, senderName } = options;
  const htmlBody = formatEmailContent(content);

  const fromEmail = senderEmail || process.env.FROM_EMAIL;
  const formattedFrom = senderName
    ? `"${senderName}" <${fromEmail}>`
    : fromEmail;

  const mailOptions = {
    from: formattedFrom,
    to: to,
    subject: subject,
    html: htmlBody,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("SES Mail sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("SES Error:", error);
    throw error;
  }
};

export default sendMail;