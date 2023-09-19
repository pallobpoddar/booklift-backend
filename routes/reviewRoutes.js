/*
 * Filename: reviewRoutes.js
 * Author: Pallob Poddar
 * Date: September 19, 2023
 * Description: This module connects the review routes with the review controller
 */

// Imports necessary modules
const express = require("express");
const reviewRoutes = express();
const reviewValidator = require("../middleware/reviewValidation");
const reviewController = require("../controller/reviewController");
const { isAuthenticated } = require("../middleware/tokenValidation");

// Sets up the routes, invokes corresponding APIs and review controller methods
reviewRoutes.post(
	"/add",
	isAuthenticated,
	reviewValidator.reviewAdd,
	reviewController.add
);

// Exports the review routes
module.exports = reviewRoutes;
