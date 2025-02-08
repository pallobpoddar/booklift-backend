/*
 * Filename: transactionValidation.js
 * Author: Pallob Poddar
 * Date: September 19, 2023
 * Description: This module is a middleware which authenticates the transaction credentials
 */

// Imports necessary modules
const { body, param } = require("express-validator");

// The checkout array validates the required fields given from request body
const transactionValidator = {
	transactionRetrieve: [
		param("id")
			.optional()
			.isMongoId()
			.withMessage("Enter a valid MongoDB Id"),
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
module.exports = transactionValidator;
