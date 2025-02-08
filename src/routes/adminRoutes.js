const express = require("express");
const adminRoutes = express();
const authGuard = require("../middleware/authGuard");
const adminValidator = require("../validators/adminValidator");
const handleValidationErrors = require("../middleware/validationMiddleware");
const adminController = require("../controllers/adminController");

adminRoutes.post(
  "",
  authGuard("Admin"),
  adminValidator.validateRegistration,
  handleValidationErrors,
  adminController.register
);

module.exports = adminRoutes;
