const express = require("express");
const transactionRoutes = express();
const transactionController = require("../controller/transactionController");
const {
	isAuthenticated,
	isAuthorized,
} = require("../middleware/tokenValidation");

transactionRoutes.post("/checkout", transactionController.add);
transactionRoutes.get(
	"/all",
	isAuthenticated,
	isAuthorized,
	transactionController.getAll
);

module.exports = transactionRoutes;
