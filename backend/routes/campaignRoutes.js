import express from "express";
import {
  createCampaign,
  getCampaigns,
  sendTestEmail,
  sendNow,
  getGlobalTemplates,
  uploadImage,
} from "../controllers/campaignController.js";
import { protect } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.post("/create", protect, createCampaign);
router.post("/test-email", protect, sendTestEmail);
router.post("/send-now", protect, sendNow);
router.get("/templates", protect, getGlobalTemplates);
router.get("/", protect, getCampaigns);
router.post("/upload-image", protect, upload.single("image"), uploadImage);


export default router;
