const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      maxLength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      maxLength: 100,
    },
    isSuperAdmin: {
      type: Boolean,
      default: false,
    },
    phone: {
      type: String,
      maxLength: 20,
    },
    address: {
      type: String,
      maxLength: 200,
    }
  },
  { timestamps: true }
);

const admin = mongoose.model("Admin", adminSchema);
module.exports = admin;
