/*
 * Filename: user-routes.js
 * Author: Pallob Poddar
 * Date: September 15, 2023
 * Description: This module connects the user routes with the user controller
 */

// Imports necessary modules
const express = require("express");
const userRoutes = express();
const userController = require("../controller/userController");
const {
	isAuthenticated,
	isAuthorized,
} = require("../middleware/login-validation");

// Sets up the routes, invokes corresponding APIs and user controller methods
userRoutes.get("/all", isAuthenticated, isAuthorized, userController.getAll);
userRoutes.put("/update-one-by-id/:id", userController.updateOneByID);
userRoutes.delete("/delete-one-by-id/:id", userController.deleteOneByID);

// Exports the user routes
module.exports = userRoutes;
