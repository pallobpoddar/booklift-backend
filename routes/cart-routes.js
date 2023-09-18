/*
 * Filename: cart-routes.js
 * Author: Pallob Poddar
 * Date: September 11, 2023
 * Description: This module connects the cart routes with the cart controller
 * License: MIT
 */

// Imports necessary modules
const express = require("express");
const cartRoutes = express();
const cartValidator = require("../middleware/cartValidation");
const cartController = require("../controller/cartController");
const { isAuthenticated } = require("../middleware/tokenValidation");

// Sets up the routes, invokes corresponding APIs and authentication controller methods
cartRoutes.post(
	"/add",
	isAuthenticated,
	cartValidator.cartAdd,
	cartController.add
);
cartRoutes.post(
	"/remove-items",
	cartValidator.cartAdd,
	cartController.removeItems
);

// Exports the cart routes
module.exports = cartRoutes;
