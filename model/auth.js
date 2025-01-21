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
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
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
    numberOfVerificationEmailSent: {
      type: Number,
      default: 0,
    },
    verificationEmailBlockedUntil: {
      type: Date,
      default: null,
    },
    numberOfSigninFailed: {
      type: Number,
      default: 0,
    },
    signinBlockedUntil: {
      type: Date || null,
      default: null,
    },
    numberOfForgotEmailSent: {
      type: Number,
      default: 0,
    },
    resetPassword: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: {
      type: String || null,
      default: null,
    },
    resetPasswordExpire: {
      type: Date || null,
      default: null,
    },
  },
  { timestamps: true }
);

const auth = mongoose.model("Auth", authSchema);
module.exports = auth;
