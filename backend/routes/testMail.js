import express from "express";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const router = express.Router();

const ses = new SESClient({
  region: process.env.AWS_REGION,
  credentials: {
accessKeyId: process.env.AWS_ACCESS_KEY_ID,
secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

router.get("/", async (req, res) => {
    console.log("TEST MAIL ROUTE HIT");
console.log("Query:", req.query);
  try {
    const { to } = req.query;

    if (!to) {
      return res.status(400).send("Recipient email is required. Use ?to=email@example.com");
    }

    const command = new SendEmailCommand({
      Source: process.env.FROM_EMAIL,
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Subject: { Data: "SES Infrastructure Test" },
        Body: {
          Html: {
            Data: `
              <html>
                <body style="font-family:Arial;">
                  <h2>SES is Working 🎉</h2>
                  <p>Email sent to: ${to}</p>
                </body>
              </html>
            `,
          },
          Text: {
            Data: "SES is working.",
          },
        },
      },
    });

    const response = await ses.send(command);

    res.json({
      message: "Email sent successfully",
      messageId: response.MessageId,
    });

  } catch (error) {
    console.error("SES ERROR:", error);
    res.status(500).send(error.message);
  }
});

export default router;