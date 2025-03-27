const {
  validateName,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validateId,
  validateToken,
} = require("./commonValidator");

const authValidator = {
  validateSignup: [validateName(), validateEmail(), validatePassword()],

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
    validateConfirmPassword(),
  ],
};

module.exports = authValidator;
