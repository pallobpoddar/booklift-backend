const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      maxLength: 100,
      index: true,
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
        message: (props) => `${props.value} is not a valid email`,
      },
    },
    phone: {
      type: String,
      maxLength: 20,
    },
    address: {
      type: String,
      maxLength: 200,
    },
  },
  { timestamps: true }
);

const user = mongoose.model("User", userSchema);
module.exports = user;
