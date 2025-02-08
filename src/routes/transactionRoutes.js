/*
 * Filename: transactionRoutes.js
 * Author: Pallob Poddar
 * Date: September 19, 2023
 * Description: This module connects the transaction routes with the transaction controller
 */

// Imports necessary modules
const express = require("express");
const transactionRoutes = express();
const transactionValidator = require("../validators/transactionValidation");
const transactionController = require("../controllers/transactionController");

// Sets up the routes, invokes corresponding APIs and transaction controller methods
transactionRoutes.post(
	"/checkout",
	transactionValidator.checkout,
	transactionController.add
);
transactionRoutes.get(
	"/all",
	transactionController.getAll
);
transactionRoutes.get(
	"/get-transactions/:id",
	transactionController.getTransactions
);
// Exports the transaction routes
module.exports = transactionRoutes;
