const config = require("./config");

const mongoose = require("mongoose");

const connectDatabase = async (callback) => {
  try {
    await mongoose.connect(config.databaseUri);
    console.log("Database connection successfully made");
    callback();
  } catch (error) {
    console.error(error);
  }
};

module.exports = connectDatabase;
