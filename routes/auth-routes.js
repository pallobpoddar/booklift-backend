/*
 * Filename: auth-routes.js
 * Author: Pallob Poddar
 * Date: September 15, 2023
 * Description: This module connects the authentication routes with the authentication controller
 */

// Imports necessary modules
const express = require("express");
const authRoutes = express();
const signupValidator = require("../middleware/signup-validation");
const authController = require("../controller/auth-controller");

// Sets up the routes, invokes corresponding APIs and authentication controller methods
authRoutes.post("/signup", signupValidator.signup, authController.signup);
authRoutes.post("/login", authController.login);

// Exports the authentication routes
module.exports = authRoutes;
