/*
 * Filename: bookRoutes.js
 * Author: Pallob Poddar
 * Date: September 16, 2023
 * Description: This module connects the book routes with the book controller
 */

// Imports necessary modules
const express = require("express");
const bookRoutes = express();
const bookValidator = require("../middleware/bookValidation");
const bookController = require("../controller/bookController");
const {
	isAuthenticated,
	isAuthorized,
} = require("../middleware/tokenValidation");

// Sets up the routes, invokes corresponding APIs and book controller methods
bookRoutes.post(
	"/add",
	isAuthenticated,
	isAuthorized,
	bookValidator.bookAdd,
	bookController.add
);
bookRoutes.get("/all", bookController.getAll);
bookRoutes.patch(
	"/update-one-by-id/:id",
	isAuthenticated,
	isAuthorized,
	bookValidator.bookUpdate,
	bookController.updateOneByID
);
bookRoutes.delete(
	"/delete-one-by-id/:id",
	isAuthenticated,
	isAuthorized,
	bookValidator.bookDelete,
	bookController.deleteOneByID
);

// Exports the book routes
module.exports = bookRoutes;
