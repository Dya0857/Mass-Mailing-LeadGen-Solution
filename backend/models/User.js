import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      // Only required for non-Google users
      required: function () {
        return !this.googleAuth;
      },
    },
    googleAuth: {
      type: Boolean,
      default: false,
    },
    avatar: {
      type: String,
    },
    // Zoho OAuth fields
    zohoAccessToken: {
      type: String,
    },
    zohoRefreshToken: {
      type: String,
    },
    zohoTokenExpiry: {
      type: Date,
    },
    zohoEmail: {
      type: String,
      default: "",
    },
    preferredEmailProvider: {
      type: String,
      enum: ["gmail", "zoho"],
      default: "gmail",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
