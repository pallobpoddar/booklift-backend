/*
 * Filename: userRoutes.js
 * Author: Pallob Poddar
 * Date: September 16, 2023
 * Description: This module connects the user routes with the user controller
 */

// Imports necessary modules
const express = require("express");
const userRoutes = express();
const userController = require("../controllers/userController");
const userValidator = require("../validators/userValidation");
const upload = require("../configs/files");

// Sets up the routes, invokes corresponding APIs and user controller methods
userRoutes.get("/all", userController.getAll);
userRoutes.patch(
  "/update-one-by-id/:id",
  upload.single("image"),
  userValidator.userUpdate,
  userController.updateOneByID
);
userRoutes.delete(
  "/delete-one-by-id/:id",
  userValidator.userDelete,
  userController.deleteOneByID
);

// Exports the user routes
module.exports = userRoutes;
