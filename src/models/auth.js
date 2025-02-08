const mongoose = require("mongoose");

const authSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      maxLength: 100,
      validate: {
        validator: (value) => {
          return /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,4}$/.test(value);
        },
      },
    },
    password: {
      type: String,
      required: true,
      maxLength: 100,
    },
    role: {
      type: String,
      enum: ["Admin", "User"],
      default: "User",
    },
    admin: {
      type: mongoose.Types.ObjectId || null,
      ref: "Admin",
      default: null,
    },
    user: {
      type: mongoose.Types.ObjectId || null,
      ref: "User",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String || null,
      default: null,
    },
    verificationTokenExpiryDate: {
      type: Date || null,
      default: null,
    },
    refreshToken: {
      type: String || null,
      default: null,
    },
    numberOfFailedSignin: {
      type: Number,
      default: 0,
    },
    signinBlockedUntil: {
      type: Date || null,
      default: null,
    },
    numberOfPasswordResetEmailSent: {
      type: Number,
      default: 0,
    },
    passwordResetToken: {
      type: String || null,
      default: null,
    },
    passwordResetTokenExpiryDate: {
      type: Date || null,
      default: null,
    },
    passwordResetBlockedUntil: {
      type: Date || null,
      default: null,
    },
  },
  { timestamps: true }
);

const auth = mongoose.model("Auth", authSchema);
module.exports = auth;
