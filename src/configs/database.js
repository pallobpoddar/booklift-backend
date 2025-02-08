const config = require("./config");

const mongoose = require("mongoose");

const databaseConnection = async (callback) => {
  try {
    if (config.databaseUrl) {
      const client = await mongoose.connect(config.databaseUrl);
      if (client) {
        console.log("Database connection successfully made");
        callback();
      } else {
        console.log("Database URL is not provided");
      }
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = databaseConnection;
