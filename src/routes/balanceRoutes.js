/*
 * Filename: balanceRoutes.js
 * Author: Pallob Poddar
 * Date: September 20, 2023
 * Description: This module connects the balance routes with the balance controller
 */

// Imports necessary modules
const express = require("express");
const balanceRoutes = express();
const balanceValidator = require("../validators/balanceValidation");
const balanceController = require("../controllers/balanceController");

balanceRoutes.post(
	"/add/:id",
	balanceValidator.balanceAdd,
	balanceController.add
);
balanceRoutes.patch(
	"/update/:id",
	balanceValidator.balanceAdd,
	balanceController.updateOneById
);

// Exports the balance routes
module.exports = balanceRoutes;
