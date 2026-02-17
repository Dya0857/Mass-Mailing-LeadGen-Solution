import mongoose from "mongoose";

const domainSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    domain: {
      type: String,
      required: true,
    },

    verified: {
      type: Boolean,
      default: false,
    },

    sesIdentityArn: String,

    dkimTokens: [String],

    status: {
      type: String,
      enum: ["pending", "verifying", "verified", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Domain", domainSchema);
