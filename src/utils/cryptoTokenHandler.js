const crypto = require("crypto");
const { promisify } = require("util");

const generateUrlToken = async () => {
  const randomBytesAsync = promisify(crypto.randomBytes);
  const buffer = await randomBytesAsync(32);

  return buffer.toString("hex");
};

const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

module.exports = { generateUrlToken, hashToken };
