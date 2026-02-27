import mongoose from "mongoose";

const emailListSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    recipients: [
      {
        email: { type: String, required: true },
        firstName: { type: String },
        company: { type: String },
        // add more fields dynamically later
      }
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);
export default mongoose.model("EmailList", emailListSchema);
