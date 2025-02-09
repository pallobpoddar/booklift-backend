const crypto = require("crypto");

const generateUrlToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

module.exports = { generateUrlToken, hashToken };
