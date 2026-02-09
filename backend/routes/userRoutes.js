import express from "express";
import { updateUserProfile, getUserProfile } from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.route("/profile").get(protect, getUserProfile).put(protect, upload.single("avatar"), updateUserProfile);

import { addTemplate, deleteTemplate, updateTemplate } from "../controllers/userController.js";

router.route("/templates").post(protect, addTemplate);
router.route("/templates/:id").delete(protect, deleteTemplate).put(protect, updateTemplate);

export default router;
