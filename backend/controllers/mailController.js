// controllers/mailController.js
import nodemailer from "nodemailer";

export const sendBulkMail = async (req, res) => {
  try {
    const { to, subject, body } = req.body;

    if (!to || !subject || !body) {
      return res.status(400).json({ message: "All fields required" });
    }

    // 'to' can be a string (single) or array (bulk)
    const recipients = Array.isArray(to) ? to : [to];

    const transporter = nodemailer.createTransport({
      service: "gmail", // or SMTP
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    for (const recipient of recipients) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: recipient,
        subject,
        text: body,
      });
    }

    res.status(200).json({ message: "Emails sent successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Error sending emails", error: err.message });
  }
};
