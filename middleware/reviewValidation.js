/*
 * Filename: reviewValidation.js
 * Author: Pallob Poddar
 * Date: September 19, 2023
 * Description: This module is a middleware which authenticates the review credentials
 */

// Imports necessary modules
const { body } = require("express-validator");

// The review array validates the required fields given from request body
const reviewValidator = {
	reviewAdd: [
		body("userId")
			.exists()
			.withMessage("Enter a user id")
			.bail()
			.isMongoId()
			.withMessage("Enter a valid mongoDB id"),
		body("bookId")
			.exists()
			.withMessage("Enter a book id")
			.bail()
			.isMongoId()
			.withMessage("Enter a valid mongoDB id"),
		body("rating")
			.exists()
			.withMessage("Enter a rating")
			.bail()
			.isInt({ min: 1, max: 5 })
			.withMessage("Rating must be between 1 and 5"),
		body("review")
			.optional()
			.isString()
			.withMessage("Review must be in words")
			.bail()
			.trim()
			.notEmpty()
			.withMessage("Review can't be empty")
			.bail()
			.isLength({ max: 1000 })
			.withMessage("Review must be within 1000 characters"),
	],
};

// Exports the validator
module.exports = reviewValidator;
