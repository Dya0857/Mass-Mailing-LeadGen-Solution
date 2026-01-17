// routes/googleAuthRoutes.js
import express from "express";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js"; // make sure path is correct
import jwt from "jsonwebtoken";

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// POST /api/auth/google
router.post("/", async (req, res) => {
  try {
    const { credential } = req.body; // frontend sends { credential }

    if (!credential) {
      return res.status(400).json({ message: "No credential received" });
    }

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new Google-authenticated user
      user = await User.create({
        name,
        email,
        googleAuth: true,
        avatar: picture,
      });
    }

    // Generate JWT
const token = jwt.sign(
  {
    id: user._id,
    name: user.name,
    email: user.email,
  },
  process.env.JWT_SECRET,
  { expiresIn: "5d" }
);


    res.json({ token, user });
  } catch (err) {
    console.error("Google Login Error:", err.message, err.stack);
    res.status(500).json({ message: "Google login failed" });
  }
});

export default router;
