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
const cartController = require("../controllers/cartController");
const { isAuthenticated } = require("../middleware/tokenValidation");

// Sets up the routes, invokes corresponding APIs and cart controller methods
cartRoutes.post(
	"/add-items",
	isAuthenticated,
	cartValidator.cartUpdate,
	cartController.addItems
);
cartRoutes.get("/get-cart/:id", isAuthenticated, cartValidator.cardRetrieve, cartController.getCart);
cartRoutes.patch(
	"/remove-items",
	isAuthenticated,
	cartValidator.cartUpdate,
	cartController.removeItems
);

// Exports the cart routes
module.exports = cartRoutes;
