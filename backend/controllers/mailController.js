import nodemailer from "nodemailer";

export const sendMail = async (req, res) => {
  const { to, subject, body } = req.body;

  try {
    // Create reusable transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,  // Gmail App Password (not normal password)
      },
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html: body,  // you can also use `text: body` if you want plain text
    };

    // Send the mail
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Mail sent successfully!" });
  } catch (error) {
    console.error("Mail send error:", error);
    res.status(500).json({ message: "Failed to send mail", error });
  }
};
