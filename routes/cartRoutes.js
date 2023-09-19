/*
 * Filename: cart-routes.js
 * Author: Pallob Poddar
 * Date: September 19, 2023
 * Description: This module connects the cart routes with the cart controller
 */

// Imports necessary modules
const express = require("express");
const cartRoutes = express();
const cartValidator = require("../middleware/cartValidation");
const cartController = require("../controller/cartController");
const transactionController = require("../controller/transactionController");
const { isAuthenticated } = require("../middleware/tokenValidation");

// Sets up the routes, invokes corresponding APIs and cart controller methods
cartRoutes.post(
	"/add-items",
	isAuthenticated,
	cartValidator.cart,
	cartController.addItems
);
cartRoutes.patch(
	"/remove-items",
	isAuthenticated,
	cartValidator.cart,
	cartController.removeItems
);
cartRoutes.post(
	"/checkout",
	isAuthenticated,
	cartValidator.checkout,
	transactionController.add
);

// Exports the cart routes
module.exports = cartRoutes;
