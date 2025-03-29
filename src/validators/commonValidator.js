const { body, param } = require("express-validator");

const validateString = (field, convertedField, max) => {
  return body(field)
    .exists()
    .withMessage(`${convertedField} is required`)
    .bail()
    .isString()
    .withMessage(`${convertedField} must contain characters`)
    .bail()
    .trim()
    .notEmpty()
    .withMessage(`${convertedField} can't be empty`)
    .bail()
    .isLength({ max: max })
    .withMessage("Character limit exceeded");
};

const validateEmail = (message) => {
  return body("email")
    .exists()
    .withMessage(message || "Email is required")
    .bail()
    .isEmail()
    .withMessage(message || "Invalid email");
};

const validatePassword = (field = "password", message) => {
  return body(field)
    .exists()
    .withMessage(message || "Password is required")
    .bail()
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minSymbols: 1,
      minNumbers: 1,
    })
    .withMessage(
      message ||
        "Password must contain at least one lowercase letter, one uppercase letter, one number, one special character and be at least 8 characters long"
    )
    .bail()
    .isLength({ max: 20 })
    .withMessage(message || "Character limit exceeded");
};

const validateId = () => {
  return param("id")
    .exists()
    .withMessage("Id is required")
    .bail()
    .isMongoId()
    .withMessage("Invalid id");
};

const validateToken = () => {
  return param("token")
    .exists()
    .withMessage("Token is required")
    .bail()
    .matches(/^[a-f0-9]{64}$/)
    .withMessage("Invalid token");
};

const validateArray = (field, min, max) => {
  return body(field)
    .isArray({ min: min, max: max })
    .withMessage(`Number of ${field} must be between ${min} and ${max}`);
};

const validateInt = (field, convertedField, min, max) => {
  body(field)
    .exists()
    .withMessage(`${convertedField} is required`)
    .bail()
    .isInt({ min: min, max: max })
    .withMessage(`${convertedField} must be between ${min} and ${max}`);
};

module.exports = {
  validateString,
  validateEmail,
  validatePassword,
  validateId,
  validateToken,
  validateArray,
  validateInt,
};
