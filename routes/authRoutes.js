/*
 * Filename: authRoutes.js
 * Author: Pallob Poddar
 * Date: September 16, 2023
 * Description: This module connects the authentication routes with the authentication controller
 */

// Imports necessary modules
const express = require("express");
const authRoutes = express();
const authValidator = require("../middleware/authValidation");
const authController = require("../controller/authController");

// Sets up the routes, invokes corresponding APIs and authentication controller methods
authRoutes.post("/signup", authController.signup);
authRoutes.post("/login", authValidator.login, authController.login);

// Exports the authentication routes
module.exports = authRoutes;
