import express from "express";
import sendEmail from "../services/emailService.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    await sendEmail(
      "dhyeyajapetkar@gmail.com", // change to your inbox
      "Test Mail",
      "<h1>It works 🚀</h1>"
    );

    res.send("Mail sent");
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

export default router;
