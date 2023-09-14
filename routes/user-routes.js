/*
 * Filename: user-routes.js
 * Author: Pallob Poddar
 * Date: September 2, 2023
 * Description: This module connects the user routes with the user controller
 * License: MIT
 */

// Imports necessary modules
const express = require("express");
const userRoutes = express();
const userController = require("../controller/userController");
const userValidator = require("../middleware/signup-validation");
const { isAuthorized } = require("../middleware/login-validation");

// Sets up the routes, invokes corresponding APIs and user controller methods
userRoutes.post("/add", userValidator.signup, userController.create);
userRoutes.get("/all", userController.getAll);
userRoutes.get("/get-one-by-id/:id", userController.getOneByID);
userRoutes.put("/update-one-by-id/:id", userController.updateOneByID);
userRoutes.delete("/delete-one-by-id/:id", userController.deleteOneByID);

// Exports the user routes
module.exports = userRoutes;
