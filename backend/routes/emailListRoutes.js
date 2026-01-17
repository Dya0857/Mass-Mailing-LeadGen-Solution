import express from "express";
import upload from "../middlewares/upload.js";
import { protect } from "../middlewares/authMiddleware.js";
import { uploadEmailListFromCSV } from "../controllers/emailListController.js";

const router = express.Router();

router.post(
  "/upload-csv",
  protect,
  upload.single("file"),
  uploadEmailListFromCSV
);

export default router;
