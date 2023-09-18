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
	cartAdd: [
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
		body("quantity")
			.exists()
			.withMessage("Product quantity must be provided")
			.bail()
			.isInt({ min: 1 })
			.withMessage("Quantity must be one or above"),
	],

	checkout: [
		body("cartId")
			.exists()
			.withMessage("Cart ID must be provided")
			.bail()
			.isMongoId()
			.withMessage("Cart ID is not in valid mongoDB format"),
	],
};

// Exports the validator
module.exports = cartValidator;
