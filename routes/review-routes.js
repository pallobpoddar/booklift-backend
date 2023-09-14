/*
 * Filename: review-routes.js
 * Author: Pallob Poddar
 * Date: September 11, 2023
 * Description: This module connects the review routes with the review controller
 * License: MIT
 */

// Imports necessary modules
const express = require("express");
const reviewRoutes = express();
const reviewValidator = require("../middleware/review-validation");
const reviewController = require("../controller/review-controller");

// Sets up the routes, invokes corresponding APIs and review controller methods
reviewRoutes.post(
	"/review-item",
	reviewValidator.review,
	reviewController.addReview
);
reviewRoutes.get("/get-all", reviewController.getReview);

// Exports the review routes
module.exports = reviewRoutes;
