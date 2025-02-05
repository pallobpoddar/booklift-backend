/*
 * Filename: reviewRoutes.js
 * Author: Pallob Poddar
 * Date: September 19, 2023
 * Description: This module connects the review routes with the review controller
 */

// Imports necessary modules
const express = require("express");
const reviewRoutes = express();
const reviewValidator = require("../validators/reviewValidation");
const reviewController = require("../controllers/reviewController");

// Sets up the routes, invokes corresponding APIs and review controller methods
reviewRoutes.post(
	"/add",
	reviewValidator.reviewAdd,
	reviewController.add
);

reviewRoutes.patch(
	"/edit",
	reviewValidator.reviewUpdate,
	reviewController.updateOneById
);

// Exports the review routes
module.exports = reviewRoutes;
