import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const emailUser = process.env.EMAIL_USER?.trim();
const emailPass = process.env.EMAIL_PASS?.trim();

console.log('Email User status:', emailUser ? 'Creds Loaded ✅' : 'Creds NOT Found ❌');

/**
 * HELPER: Convert plain text/markdown to branded HTML
 */
const formatEmailContent = (content) => {
  // 1. Basic Markdown: Bold (**text**)
  let formatted = content.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');

  // 2. Extract CTA Buttons [CTA Button: Text]
  formatted = formatted.replace(/\[CTA Button: (.*?)\]/gi, (match, btnText) => {
    return `
      <div style="text-align: center; margin: 30px 0;">
        <a href="#" style="background-color: #00695C; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
          ${btnText}
        </a>
      </div>
    `;
  });

  // 3. Handle Newlines (convert to <br/>), support \r\n
  formatted = formatted.replace(/\r?\n/g, '<br/>');

  // 4. Wrap in a professional HTML template
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.8; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden; background-color: #fcfcfc;">
      <div style="background-color: #00695C; padding: 25px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Event Invitation</h1>
      </div>
      <div style="padding: 40px; background-color: #ffffff;">
        <div style="font-size: 16px; color: #444; text-align: left;">
          ${formatted}
        </div>
      </div>
      <div style="background-color: #f4f4f4; padding: 20px; text-align: center; border-top: 1px solid #eee; font-size: 11px; color: #777;">
        <p style="margin: 0;">Sent via <b>MailMaster</b> Dashboard</p>
        <p style="margin: 8px 0 0 0;">You are receiving this because you're part of our campus community.</p>
        <p style="margin: 5px 0 0 0;">&copy; 2026 Cultural Committee</p>
      </div>
    </div>
  `;
};

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for 465, false for 587
  auth: {
    user: emailUser,
    pass: emailPass
  },
  tls: {
    rejectUnauthorized: false
  }
});

export const sendMail = async (to, subject, content) => {
  const htmlBody = formatEmailContent(content);

  const mailOptions = {
    from: `"Mailing Prototype" <${emailUser}>`,
    to,
    subject,
    html: htmlBody
  };

  await transporter.sendMail(mailOptions);
};
