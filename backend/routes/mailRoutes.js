// routes/mailRoutes.js
import express from "express";
import { sendBulkMail } from "../controllers/mailController.js";
const router = express.Router();

router.post("/", sendBulkMail);

export default router;
