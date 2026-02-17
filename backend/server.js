import 'dotenv/config';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import googleAuthRoutes from "./routes/googleAuthRoutes.js";
import campaignRoutes from "./routes/campaignRoutes.js";
import emailListRoutes from "./routes/emailListRoutes.js";
import aiRoutes from "./routes/geminiRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import testMailRoutes from "./routes/testMail.js";



// dotenv.config() removed as it is handled by import 'dotenv/config'
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("MailMaster API Running"));

app.use("/api/auth", authRoutes);
app.use("/api/auth/google", googleAuthRoutes);
app.use("/api/campaign", campaignRoutes);
app.use("/api/email-lists", emailListRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/users", userRoutes);
app.use("/api/test-mail", testMailRoutes);


// Make uploads folder static
import path from "path";
const __dirname = path.resolve();
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
