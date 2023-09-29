/*
 * Filename: balanceRoutes.js
 * Author: Pallob Poddar
 * Date: September 20, 2023
 * Description: This module connects the balance routes with the balance controller
 */

// Imports necessary modules
const express = require("express");
const balanceRoutes = express();
const balanceValidator = require("../middleware/balanceValidation");
const balanceController = require("../controller/balanceController");
const { isAuthenticated } = require("../middleware/tokenValidation");

balanceRoutes.post(
	"/add/:id",
	isAuthenticated,
	balanceValidator.balanceAdd,
	balanceController.add
);
balanceRoutes.patch(
	"/update/:id",
	isAuthenticated,
	balanceValidator.balanceAdd,
	balanceController.updateOneById
);

// Exports the balance routes
module.exports = balanceRoutes;
