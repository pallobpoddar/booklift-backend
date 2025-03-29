/*
 * Filename: bookRoutes.js
 * Author: Pallob Poddar
 * Date: September 18, 2023
 * Description: This module connects the book routes with the book controller
 */

// Imports necessary modules
const express = require("express");
const bookRoutes = express();
const bookValidator = require("../validators/bookValidator");
const bookController = require("../controllers/bookController");

// Sets up the routes, invokes corresponding APIs and book controller methods
bookRoutes.post(
	"/add",
	// isAuthenticated,
	// isAuthorized,
	// bookValidator.bookAdd,
	bookController.add
);
bookRoutes.get(
	"/all",
	// isAuthenticated,
	bookController.getAll
);
bookRoutes.patch(
	"/update-one-by-id/:id",
	// isAuthenticated,
	// isAuthorized,
	bookController.updateOneByID
);
bookRoutes.delete(
	"/delete-one-by-id/:id",
	// isAuthenticated,
	// isAuthorized,
	bookController.deleteOneByID
);

// Exports the book routes
module.exports = bookRoutes;
