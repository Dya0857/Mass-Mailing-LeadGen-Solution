import express from "express";
import {
  createCampaign,
  getCampaigns,
  sendTestEmail,
  sendNow,
} from "../controllers/campaignController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/create", protect, createCampaign);
router.post("/test-email", protect, sendTestEmail);
router.post("/send-now", protect, sendNow);
router.get("/", protect, getCampaigns);

export default router;
