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
  "/admin-registration",
  authGuard("Admin"),
  authValidator.validateAdminRegistration,
  handleValidationErrors,
  authController.registerAdmin
);
authRoutes.post(
  "/signin",
  authValidator.validateSignin,
  handleValidationErrors,
  authController.signIn
);
authRoutes.post("/signout/:id", authGuard(), authController.signOut);
authRoutes.post("/token-refresh", authController.refreshToken);
authRoutes.post(
  "/email-verification/:token/:id",
  authValidator.validateEmailVerification,
  handleValidationErrors,
  authController.verifyEmail
);
authRoutes.post(
  "/email-verification-resend/:id",
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
  "/password-reset/:token/:id",
  authValidator.validatePasswordReset,
  handleValidationErrors,
  authController.resetPassword
);

module.exports = authRoutes;
