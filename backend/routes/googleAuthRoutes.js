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
    const { credential, role } = req.body; // frontend sends { credential, role }

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
      // Check if any users exist
      const userCount = await User.countDocuments({});
      const assignedRole = userCount === 0 ? "admin" : (role || "user");

      // Create new Google-authenticated user
      user = await User.create({
        name,
        email,
        googleAuth: true,
        avatar: picture,
        role: assignedRole,
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || "user",
      },
      process.env.JWT_SECRET,
      { expiresIn: "5d" }
    );


    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || "user",
        avatar: user.avatar,
      }
    });
  } catch (err) {
    console.error("Google Login Error:", err.message, err.stack);
    res.status(500).json({ message: "Google login failed" });
  }
});

export default router;
