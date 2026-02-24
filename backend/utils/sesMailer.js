import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const sesClient = new SESClient({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

export const sendSESEmail = async (to, subject, htmlBody, senderName = "MailMaster") => {
    const params = {
        Destination: {
            ToAddresses: [to],
        },
        Message: {
            Body: {
                Html: {
                    Charset: "UTF-8",
                    Data: htmlBody,
                },
            },
            Subject: {
                Charset: "UTF-8",
                Data: subject,
            },
        },
        Source: `"${senderName}" <${process.env.FROM_EMAIL || process.env.EMAIL_USER}>`, // SES requires verified sender.
    };

    try {
        const command = new SendEmailCommand(params);
        const result = await sesClient.send(command);
        console.log(`✅ SES Mail sent to ${to}: ${result.MessageId}`);
        return result;
    } catch (err) {
        console.error(`❌ SES Mail send error for ${to}:`, err);
        throw err;
    }
};
