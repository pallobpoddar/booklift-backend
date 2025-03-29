const mongoose = require("mongoose");

const authSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      maxLength: 320,
      validate: {
        validator: (value) => {
          return /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,4}$/.test(value);
        },
        message: (props) => `${props.value} is not a valid email`,
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
      type: mongoose.Types.ObjectId,
      ref: "Admin",
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
    },
    emailVerificationTokenExpiryDate: {
      type: Date,
    },
    refreshToken: {
      type: String,
    },
    numberOfFailedSignin: {
      type: Number,
      default: 0,
    },
    signinBlockedUntil: {
      type: Date,
    },
    numberOfPasswordResetEmailSent: {
      type: Number,
      default: 0,
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetTokenExpiryDate: {
      type: Date,
    },
    passwordResetBlockedUntil: {
      type: Date,
    },
  },
  { timestamps: true }
);

const auth = mongoose.model("Auth", authSchema);
module.exports = auth;
