import express from "express";
import { updateUserProfile } from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.route("/profile").put(protect, upload.single("avatar"), updateUserProfile);

export default router;
