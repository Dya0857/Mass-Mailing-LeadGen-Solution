import express from "express";
import {
    updateUserProfile,
    getUserProfile,
    addTemplate,
    deleteTemplate,
    updateTemplate,
    getGlobalTemplates
} from "../controllers/userController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, upload.single("avatar"), updateUserProfile);

// Global templates should be accessible to all logged in users
router.get("/global-templates", protect, getGlobalTemplates);

router.post("/templates", protect, admin, addTemplate);
router.route("/templates/:id")
    .delete(protect, admin, deleteTemplate)
    .put(protect, admin, updateTemplate);

export default router;
