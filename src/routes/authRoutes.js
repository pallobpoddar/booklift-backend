const express = require("express");
const authRoutes = express();
const authValidator = require("../validators/authValidator");
const authController = require("../controllers/authController");
const handleValidationErrors = require("../middleware/validationMiddleware");
const authGuard = require("../middleware/authGuard");

authRoutes.post(
  "/signup",
  authValidator.validateSignup,
  handleValidationErrors,
  authController.signUp
);
authRoutes.post(
  "/signin",
  authValidator.validateSignin,
  handleValidationErrors,
  authController.signIn
);
authRoutes.post("/:id/signout", authGuard(), authController.signOut);
authRoutes.post("/:id/token-refresh", authController.refreshToken);
authRoutes.post(
  "/:id/email-verification/:token",
  authValidator.validateEmailVerification,
  handleValidationErrors,
  authController.verifyEmail
);
authRoutes.post(
  "/:id/email-verification-resend",
  authValidator.validateVerificationEmailResending,
  handleValidationErrors,
  authController.resendVerificationEmail
);
authRoutes.post(
  "/forgot-password",
  authValidator.validatePasswordResetEmailSending,
  handleValidationErrors,
  authController.sendPasswordResetEmail
);
authRoutes.post(
  "/:id/password-reset/:token",
  authValidator.validatePasswordReset,
  handleValidationErrors,
  authController.resetPassword
);
authRoutes.patch(
  "/:id/password-change",
  authGuard(),
  authValidator.validatePasswordChange,
  handleValidationErrors,
  authController.changePassword
);

module.exports = authRoutes;
