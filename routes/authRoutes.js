/*
 * Filename: authRoutes.js
 * Author: Pallob Poddar
 * Date: October 14, 2023
 * Description: This module connects the authentication routes with the authentication controller
 */

// Imports necessary modules
const express = require("express");
const authRoutes = express();
const authValidator = require("../middleware/authValidation");
const authController = require("../controller/authController");

// Sets up the routes, invokes corresponding APIs and authentication controller methods
authRoutes.post("/signup", authValidator.signup, authController.signup);
authRoutes.post("/signin", authValidator.signin, authController.signin);

// Exports the authentication routes
module.exports = authRoutes;
