const bcrypt = require("bcrypt");

const hashPassword = async (password) => {
  const salt = 10;
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};

const comparePasswords = async (rawPassword, hashedPassword) => {
  const result = await bcrypt.compare(rawPassword, hashedPassword);
  return result;
};

module.exports = { hashPassword, comparePasswords };
