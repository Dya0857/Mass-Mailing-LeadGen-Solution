import mongoose from "mongoose";

const emailListSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    emails: {
      type: [String],
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("EmailList", emailListSchema);
