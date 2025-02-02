const express = require("express");
const authRoutes = express();
const authValidator = require("../middleware/authValidation");
const authController = require("../controllers/authController");
const handleValidationErrors = require("../middleware/validationMiddleware");

authRoutes.post(
  "/signup",
  authValidator.signUp,
  handleValidationErrors,
  authController.signUp
);
authRoutes.post(
  "/signin",
  authValidator.signIn,
  handleValidationErrors,
  authController.signIn
);
authRoutes.post("/signout/:id", authController.signOut);
authRoutes.post("/token-refresh", authController.refreshToken);
authRoutes.post(
  "/email-verification/:token/:id",
  authValidator.verifyEmail,
  handleValidationErrors,
  authController.verifyEmail
);
authRoutes.post(
  "/email-verification-resend/:id",
  authValidator.resendVerificationEmail,
  handleValidationErrors,
  authController.resendVerificationEmail
);
authRoutes.post(
  "/forgot-password",
  authValidator.sendPasswordResetEmail,
  handleValidationErrors,
  authController.sendPasswordResetEmail
);
authRoutes.post(
  "/password-reset/:token/:id",
  authValidator.resetPassword,
  handleValidationErrors,
  authController.resetPassword
);

module.exports = authRoutes;
