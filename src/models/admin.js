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
      maxLength: 320,
      validate: {
        validator: (value) => {
          return /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,4}$/.test(value);
        },
        message: props => `${props.value} is not a valid email`,
      },
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
