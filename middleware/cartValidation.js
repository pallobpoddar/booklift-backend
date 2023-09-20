/*
 * Filename: cartValidation.js
 * Author: Pallob Poddar
 * Date: September 18, 2023
 * Description: This module is a middleware which authenticates the cart credentials
 */

// Imports necessary modules
const { body, param } = require("express-validator");

// The cartUpdate array validates the required fields given from request body
const cartValidator = {
	cartUpdate: [
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

	cardRetrieve: [
		param("id").optional().isMongoId().withMessage("Enter a valid MongoDB Id"),
	]
};

// Exports the validator
module.exports = cartValidator;
