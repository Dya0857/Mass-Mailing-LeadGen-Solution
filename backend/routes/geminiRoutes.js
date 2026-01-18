import express from "express";
import { generateCampaignAI } from "../controllers/geminiController.js";

const router = express.Router();

// POST /api/ai/generate-campaign
router.post("/generate-campaign", generateCampaignAI);

export default router;
