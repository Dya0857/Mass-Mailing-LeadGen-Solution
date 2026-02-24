import nodemailer from "nodemailer";
import { sendSESEmail } from "./sesMailer.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const emailUser = (process.env.SES_SMTP_USER || process.env.EMAIL_USER)?.trim();
const emailPass = (process.env.SES_SMTP_PASS || process.env.EMAIL_PASS)?.trim();
const sesHost = process.env.SES_HOST?.trim();


console.log("Email User status:", emailUser ? "Creds Loaded ✅" : "Creds NOT Found ❌");

/**
 * HELPER: Convert plain text/markdown to branded HTML
 */
const formatEmailContent = (content) => {
  // Convert Markdown bold to HTML bold
  let formatted = content.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");

  // Handle CTA Buttons
  formatted = formatted.replace(/\[CTA Button: (.*?)\]/gi, (match, btnText) => {
    return `
      <div style="text-align: center; margin: 30px 0;">
        <a href="#" style="background-color: #00695C; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
          ${btnText}
        </a>
      </div>
    `;
  });

  // Convert newlines to <br/> but avoid breaking existing HTML tags
  // We split by tags to avoid adding <br/> inside <img> or <a> tags
  const parts = formatted.split(/(<[^>]*>)/g);
  formatted = parts.map(part => {
    if (part.startsWith('<') && part.endsWith('>')) {
      return part; // Return tag as is
    }
    return part.replace(/\r?\n/g, "<br/>");
  }).join('');

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
 * SMTP Transporter (Defaults to Gmail if SES_HOST is missing)
 */
const transporterConfig = process.env.SES_HOST
  ? {
    host: process.env.SES_HOST,
    port: process.env.SES_PORT || 587,
    secure: process.env.SES_PORT == 465,
    auth: { user: emailUser, pass: emailPass },
    tls: { rejectUnauthorized: false } // Common fix for certificate chain issues
  }

  : {
    service: 'gmail',
    auth: { user: emailUser, pass: emailPass },
  };

const transporter = nodemailer.createTransport(transporterConfig);

/**
 * Default export function
 */
const sendMail = async (to, subject, content, options = {}) => {
  const { senderName = "MailMaster", provider = process.env.SES_HOST ? 'ses' : 'gmail' } = options;
  const htmlBody = formatEmailContent(content);


  console.log(`📧 Sending mail via provider: ${provider}`);
  console.log(`DEBUG - SES_HOST: ${process.env.SES_HOST}`);

  // If SES provider is chosen, check if we should use SDK or SMTP
  if (provider === 'ses' || provider === 'amazon') {
    if (!process.env.SES_HOST) {
      console.log("Using SES SDK (no SMTP host found)");
      return sendSESEmail(to, subject, htmlBody, senderName);
    } else {
      console.log("Using SES SMTP via Nodemailer (SMTP host found)");
      // Fall through to Nodemailer logic
    }
  }


  // Default: Nodemailer (Gmail)
  const mailOptions = {
    from: `"${senderName}" <${process.env.FROM_EMAIL || process.env.EMAIL_USER}>`,
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
