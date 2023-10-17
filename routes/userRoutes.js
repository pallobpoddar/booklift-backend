/*
 * Filename: userRoutes.js
 * Author: Pallob Poddar
 * Date: September 16, 2023
 * Description: This module connects the user routes with the user controller
 */

// Imports necessary modules
const express = require("express");
const userRoutes = express();
const userController = require("../controller/userController");
const userValidator = require("../middleware/userValidation");
const upload = require("../config/files");
const {
	isAuthenticated,
	isAuthorized,
} = require("../middleware/tokenValidation");

// Sets up the routes, invokes corresponding APIs and user controller methods
userRoutes.get("/all", isAuthenticated, isAuthorized, userController.getAll);
userRoutes.patch(
	"/update-one-by-id/:id",
	isAuthenticated,
	isAuthorized,
	upload.single("image"),
	userValidator.userUpdate,
	userController.updateOneByID
);
userRoutes.delete(
	"/delete-one-by-id/:id",
	isAuthenticated,
	isAuthorized,
	userValidator.userDelete,
	userController.deleteOneByID
);

// Exports the user routes
module.exports = userRoutes;
