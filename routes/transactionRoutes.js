/*
 * Filename: transactionRoutes.js
 * Author: Pallob Poddar
 * Date: September 19, 2023
 * Description: This module connects the transaction routes with the transaction controller
 */

// Imports necessary modules
const express = require("express");
const transactionRoutes = express();
const transactionValidator = require("../middleware/transactionValidation");
const transactionController = require("../controller/transactionController");
const {
	isAuthenticated,
	isAuthorized,
} = require("../middleware/tokenValidation");

// Sets up the routes, invokes corresponding APIs and transaction controller methods
transactionRoutes.post(
	"/checkout",
	isAuthenticated,
	transactionValidator.checkout,
	transactionController.add
);
transactionRoutes.get(
	"/all",
	isAuthenticated,
	isAuthorized,
	transactionController.getAll
);
transactionRoutes.get(
	"/get-transactions/:id",
	isAuthenticated,
	transactionController.getTransactions
);
// Exports the transaction routes
module.exports = transactionRoutes;
