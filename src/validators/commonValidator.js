const { body, param } = require("express-validator");

const validateName = () => {
  return body("name")
    .exists()
    .withMessage("Name is required")
    .bail()
    .isString()
    .withMessage("Name must contain characters")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Name can't be empty")
    .bail()
    .isLength({ max: 100 })
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

const validateConfirmPassword = () => {
  return body("confirmPassword")
    .exists()
    .withMessage("Confirm password is required")
    .bail()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords don't match");
      }
      return true;
    });
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
    .isLength({ min: 64, max: 64 })
    .withMessage("Invalid token")
    .bail()
    .matches(/^[a-f0-9]{64}$/i)
    .withMessage("Invalid token");
};

module.exports = {
  validateName,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validateId,
  validateToken,
};
