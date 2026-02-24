// models/Campaign.js
import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    mode: {
      type: String,
      enum: ["manual", "ai"],
      default: "manual",
    },

    subject: { type: String, required: true },

    previewText: { type: String, default: "" },

    senderName: { type: String, required: true },

    content: { type: String, required: true },

    variations: [
      {
        subject: { type: String, required: true },
        body: { type: String, required: true },
      }
    ],

    // ✅ CORRECT WAY
    emailList: {
      type: String,
      required: true,
    },

    recipients: [
      {
        type: String,
        required: true,
      }
    ],

    scheduleAt: { type: Date, default: null },

    status: {
      type: String,
      enum: ["draft", "scheduled", "sending", "completed"],
      default: "draft",
    },

    emailProvider: {
      type: String,
      enum: ["gmail", "zoho", "ses"],
      default: "gmail",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Campaign", campaignSchema);
