/*
 * Filename: review-validation.js
 * Author: Pallob Poddar
 * Date: September 11, 2023
 * Description: This module is a middleware which authenticates the review credentials
 * License: MIT
 */

// Imports necessary modules
const { body } = require("express-validator");

// The review array validates the required fields given from request body
const reviewValidator = {
	review: [
		body("userId")
			.exists()
			.withMessage("User Id must be provided")
			.bail()
			.isMongoId()
			.withMessage("User ID is not in valid mongoDB format"),
		body("productId")
			.exists()
			.withMessage("Product ID must be provided")
			.bail()
			.isMongoId()
			.withMessage("Product ID is not in valid mongoDB format"),
		body("rating")
			.exists()
			.withMessage("Rating must be provided")
			.bail()
			.isInt({ min: 1, max: 5 })
			.withMessage("Rating must be between 1 and 5"),
		body("review")
			.isString()
			.withMessage("Review is not in valid format")
			.bail()
			.isLength({ max: 1000 })
			.withMessage("Words limit exceeded"),
	],
};

// Exports the validator
module.exports = reviewValidator;
