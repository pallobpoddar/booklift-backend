const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const config = require("../configs/config");

const signJwtAsync = promisify(jwt.sign);
const verifyJwtAsync = promisify(jwt.verify);

const generateAccessToken = async (payload) => {
  const token = await signJwtAsync(payload, config.accessTokenSecret, {
    expiresIn: config.accessTokenValidityPeriod,
  });

  return token;
};

const generateRefreshToken = async (payload) => {
  const token = await signJwtAsync(payload, config.refreshTokenSecret, {
    expiresIn: config.refreshTokenValidityPeriod,
  });

  return token;
};

const verifyAccessToken = async (token) => {
  return await verifyJwtAsync(token, config.accessTokenSecret);
};

const verifyRefreshToken = async (token) => {
  return await verifyJwtAsync(token, config.refreshTokenSecret);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
