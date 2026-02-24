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
import cron from "node-cron";
import { processCampaigns } from "./jobs/campaignJob.js";

// ...
// connectDB(); called earlier

// Initialize Cron Job for Email Scheduling (Runs every minute)
cron.schedule("* * * * *", () => {
  processCampaigns();
});
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
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5005;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
