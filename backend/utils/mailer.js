import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import dotenv from "dotenv";

dotenv.config();

const ses = new SESClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
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
  const htmlBody = formatEmailContent(content);

  // 🔥 Dynamic sender support
  const { senderEmail, senderName } = options;

  const fromEmail = senderEmail || process.env.FROM_EMAIL;

  const formattedFrom = senderName
    ? `"${senderName}" <${fromEmail}>`
    : fromEmail;

  const params = {
    Source: formattedFrom,
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Subject: { Data: subject },
      Body: {
        Html: { Data: htmlBody },
      },
    },
  };

  try {
    const command = new SendEmailCommand(params);
    const response = await ses.send(command);
    console.log("SES Mail sent:", response.MessageId);
    return response;
  } catch (error) {
    console.error("SES Error:", error);
    throw error;
  }
};

export default sendMail;