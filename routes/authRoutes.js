const express = require("express");
const authRoutes = express();
const authValidator = require("../middleware/authValidation");
const authController = require("../controller/authController");
const handleValidationErrors = require("../middleware/validationMiddleware");

authRoutes.post("/signup", authValidator.signup, handleValidationErrors, authController.signup);
authRoutes.post("/signin", authValidator.signin, authController.signin);
authRoutes.post(
	"/forgot-password",
	authValidator.forgotPassword,
	authController.sendForgotPasswordEmail
);
authRoutes.post("/reset-password", authController.resetPassword);

module.exports = authRoutes;
