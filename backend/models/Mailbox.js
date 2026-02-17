import mongoose from "mongoose";

const mailboxSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    domainId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Domain",
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    dailyLimit: {
      type: Number,
      default: 30,
    },

    sentToday: {
      type: Number,
      default: 0,
    },

    warmupStage: {
      type: Number,
      default: 1,
    },

    reputationScore: {
      type: Number,
      default: 100,
    },

    status: {
      type: String,
      enum: ["active", "paused", "blocked"],
      default: "active",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Mailbox", mailboxSchema);
