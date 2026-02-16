import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const emailUser = process.env.SES_SMTP_USER?.trim();
const emailPass = process.env.SES_SMTP_PASS?.trim();

console.log("Email User status:", emailUser ? "Creds Loaded ✅" : "Creds NOT Found ❌");

/**
 * HELPER: Convert plain text/markdown to branded HTML
 */
const formatEmailContent = (content) => {
  let formatted = content.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");

  formatted = formatted.replace(/\[CTA Button: (.*?)\]/gi, (match, btnText) => {
    return `
      <div style="text-align: center; margin: 30px 0;">
        <a href="#" style="background-color: #00695C; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
          ${btnText}
        </a>
      </div>
    `;
  });

  formatted = formatted.replace(/\r?\n/g, "<br/>");

  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.8; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
      <div style="background-color: #00695C; padding: 25px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Email Campaign</h1>
      </div>
      <div style="padding: 40px; background-color: #ffffff;">
        <div style="font-size: 16px; color: #444; text-align: left;">
          ${formatted}
        </div>
      </div>
      <div style="background-color: #f4f4f4; padding: 20px; text-align: center; border-top: 1px solid #eee; font-size: 11px; color: #777;">
        <p style="margin: 0;">Sent via <b>MailMaster</b></p>
        <p style="margin: 5px 0 0 0;">&copy; 2026 MailMaster</p>
      </div>
    </div>
  `;
};

/**
 * SES SMTP Transporter
 */
const transporter = nodemailer.createTransport({
  host: process.env.SES_HOST,
  port: process.env.SES_PORT,
  secure: false,
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

/**
 * Default export function
 */
const sendMail = async (to, subject, content, options = {}) => {
  const { senderName = "MailMaster" } = options;
  const htmlBody = formatEmailContent(content);

  const mailOptions = {
    from: `"${senderName}" <${process.env.FROM_EMAIL}>`,
    to,
    subject,
    html: htmlBody,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Mail sent to ${to}: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error(`❌ Mail send error for ${to}:`, err);
    throw err;
  }
};

export default sendMail;
