const { body } = require("express-validator");

const adminValidator = {
  validateRegistration: [
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
      .withMessage("Incorrect email or password")
      .bail()
      .isEmail()
      .withMessage("Incorrect email or password"),
  ],
};

module.exports = adminValidator;
