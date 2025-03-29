const {
  validateString,
  validateEmail,
  validatePassword,
  validateId,
  validateToken,
} = require("./commonValidator");

const authValidator = {
  validateSignup: [
    validateString("name", "Name", 100),
    validateEmail(),
    validatePassword(),
  ],

  validateSignin: [
    validateEmail("Incorrect email or password"),
    validatePassword("password", "Incorrect email or password"),
  ],

  validateSignout: [validateId()],

  validateEmailVerification: [validateToken(), validateId()],

  validateVerificationEmailResending: [validateId()],

  validatePasswordResetEmailSending: [validateEmail()],

  validatePasswordReset: [
    validateToken(),
    validateId(),
    validatePassword("newPassword"),
  ],

  validatePasswordChange: [
    validateId(),
    validatePassword("currentPassword", "Incorrect password"),
    validatePassword("newPassword"),
  ],
};

module.exports = authValidator;
