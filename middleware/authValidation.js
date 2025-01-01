const { body } = require("express-validator");

const validateEmail = (message) => {
  return body("email").isEmail().withMessage(message);
};

const validatePassword = (message) => {
  return body("password")
    .exists()
    .withMessage("Password is required")
    .bail()
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minSymbols: 1,
      minNumbers: 1,
    })
    .withMessage(message);
};

const authValidator = {
  signup: [
    body("name")
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
      .withMessage("Character limit exceeded"),
    body("email")
      .exists()
      .withMessage("Email is required")
      .bail()
      .isEmail()
      .withMessage("Invalid email"),
    body("password")
      .exists()
      .withMessage("Password is required")
      .bail()
      .isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minSymbols: 1,
        minNumbers: 1,
      })
      .withMessage(
        "Password must contain at least one lowercase letter, one uppercase letter, one number, one special character and be at least 8 characters long"
      )
      .bail()
      .isLength({ max: 50 })
      .withMessage("Character limit exceeded"),
    body("confirmPassword")
      .exists()
      .withMessage("Confirm password is required")
      .bail()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Passwords don't match");
        }
        return true;
      }),
  ],

  signin: [
    validateEmail("Incorrect email or password"),
    validatePassword("Incorrect email or password"),
  ],

  forgotPassword: [validateEmail("Invalid email")],
};

module.exports = authValidator;
