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

const generateStrongPassword = async (length = 8) => {
  const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*()-_=+[]{}|;:',.<>?/";
  const allChars = letters + numbers + symbols;

  let password = "";

  password += letters[Math.floor(Math.random() * letters.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  for (let i = 3; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  password = password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");

  return password;
};

module.exports = { hashPassword, comparePasswords, generateStrongPassword };
