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

const formatEmailContent = (content) => {
  let formatted = content.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
  formatted = formatted.replace(/\r?\n/g, "<br/>");

  return `
    <div style="font-family: Arial; max-width:600px; margin:auto;">
      ${formatted}
    </div>
  `;
};

const sendMail = async (to, subject, content, options = {}) => {
  const htmlBody = formatEmailContent(content);

  const params = {
    Source: process.env.FROM_EMAIL,
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