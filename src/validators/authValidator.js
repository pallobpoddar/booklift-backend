const {
  validateName,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validateId,
  validateToken,
} = require("./commonValidator");

const authValidator = {
  validateSignup: [
    validateName(),
    validateEmail(),
    validatePassword(),
    validateConfirmPassword(),
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
    validateConfirmPassword(),
  ],

  validatePasswordChange: [
    validateId(),
    validatePassword("currentPassword", "Incorrect password"),
    validatePassword("newPassword"),
    validateConfirmPassword(),
  ],
};

module.exports = authValidator;
