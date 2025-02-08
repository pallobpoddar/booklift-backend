/*
 * Filename: discountRoutes.js
 * Author: Pallob Poddar
 * Date: September 19, 2023
 * Description: This module connects the discount routes with the discount controller
 */

// Imports necessary modules
const express = require("express");
const discountRoutes = express();
const discountValidator = require("../validators/discountValidation");
const discountController = require("../controllers/discountController");

// Sets up the routes, invokes corresponding APIs and discount controller methods
discountRoutes.post(
	"/add",
	discountValidator.discountAdd,
	discountController.add
);
discountRoutes.patch(
	"/update-one-by-id/:id",
	discountValidator.discountUpdate,
	discountController.updateOneById
);

// Exports the discount routes
module.exports = discountRoutes;
