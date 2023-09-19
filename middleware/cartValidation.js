/*
 * Filename: cartValidation.js
 * Author: Pallob Poddar
 * Date: September 18, 2023
 * Description: This module is a middleware which authenticates the cart credentials
 */

// Imports necessary modules
const { body } = require("express-validator");

// The cart and checkout array validates the required fields given from request body
const cartValidator = {
	cart: [
		body("userId")
			.exists()
			.withMessage("User Id must be provided")
			.bail()
			.isMongoId()
			.withMessage("User ID is not in valid mongoDB format"),
		body("bookId")
			.exists()
			.withMessage("Book ID must be provided")
			.bail()
			.isMongoId()
			.withMessage("Book ID is not in valid mongoDB format"),
		body("quantity")
			.exists()
			.withMessage("Quantity must be provided")
			.bail()
			.isInt({ min: 1, max: 1000 })
			.withMessage("Quantity must between 1 and 1000"),
	],

	checkout: [
		body("userId")
			.exists()
			.withMessage("User ID must be provided")
			.bail()
			.isMongoId()
			.withMessage("User ID is not in valid mongoDB format"),
	],
};

// Exports the validator
module.exports = cartValidator;
