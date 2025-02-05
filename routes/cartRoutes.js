/*
 * Filename: cart-routes.js
 * Author: Pallob Poddar
 * Date: September 19, 2023
 * Description: This module connects the cart routes with the cart controller
 */

// Imports necessary modules
const express = require("express");
const cartRoutes = express();
const cartValidator = require("../validators/cartValidation");
const cartController = require("../controllers/cartController");


// Sets up the routes, invokes corresponding APIs and cart controller methods
cartRoutes.post(
	"/add-items",
	cartValidator.cartUpdate,
	cartController.addItems
);
cartRoutes.get("/get-cart/:id", cartValidator.cardRetrieve, cartController.getCart);
cartRoutes.patch(
	"/remove-items",
	cartValidator.cartUpdate,
	cartController.removeItems
);

// Exports the cart routes
module.exports = cartRoutes;
