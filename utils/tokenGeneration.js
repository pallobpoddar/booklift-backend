const dotEnv = require("dotenv");
const jwt = require("jsonwebtoken");

dotEnv.config();

const generateAccessToken = (payload) => {
  const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
  const token = jwt.sign(payload, accessTokenSecret, { expiresIn: "15m" });
  return token;
};

const generateRefreshToken = (payload) => {
  const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
  const refreshTokenExpiration = 7 * 24 * 60 * 60 * 1000;
  const token = jwt.sign(payload, refreshTokenSecret, {
    expiresIn: refreshTokenExpiration,
  });
  return token;
};

module.exports = { generateAccessToken, generateRefreshToken };
