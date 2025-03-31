const express = require("express");
const bookRoutes = express();
const bookValidator = require("../validators/bookValidator");
const bookController = require("../controllers/bookController");
const handleValidationErrors = require("../middleware/validationMiddleware");
const authGuard = require("../middleware/authGuard");

bookRoutes.post(
	"/",
	authGuard("Admin"),
	bookValidator.validateAddition,
	handleValidationErrors,
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

module.exports = bookRoutes;
