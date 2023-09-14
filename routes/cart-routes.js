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
const cartValidator = require("../middleware/cart-validation");
const cartController = require("../controller/cart-controller");

// Sets up the routes, invokes corresponding APIs and authentication controller methods
cartRoutes.post("/add-items", cartValidator.cart, cartController.addItems);
cartRoutes.post(
	"/remove-items",
	cartValidator.cart,
	cartController.removeItems
);

// Exports the cart routes
module.exports = cartRoutes;
