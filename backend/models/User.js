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

    
    // User defined email templates
    templates: [
      {
        name: {
          type: String,
          required: true,
        },
        subject: {
          type: String,
          default: "",
        },
        body: {
          type: String,
          default: "",
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
