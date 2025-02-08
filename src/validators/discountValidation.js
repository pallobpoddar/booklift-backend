/*
 * Filename: discountValidation.js
 * Author: Pallob Poddar
 * Date: September 19, 2023
 * Description: This module is a middleware which authenticates the discount credentials
 */

// Imports necessary modules
const { body, param } = require("express-validator");

// The discountAdd, discountUpdate array validates the required fields given from request body
const discountValidator = {
	discountAdd: [
		body("bookId")
			.exists()
			.withMessage("Enter a book id")
			.bail()
			.isMongoId()
			.withMessage("Enter a valid mongoDB id"),
		body("percentage")
			.exists()
			.withMessage("Enter a discount percentage")
			.bail()
			.isInt({ min: 1, max: 80 })
			.withMessage("Discount percentage must be between 1 and 80"),
		body("availableUntil")
			.exists()
			.withMessage("Enter a discount availability date")
			.bail()
			.isISO8601()
			.withMessage("Enter a valid date"),
	],

	discountUpdate: [
		param("id").optional().isMongoId().withMessage("Enter a valid MongoDB Id"),
		body("percentage")
			.optional()
			.isInt({ min: 1, max: 80 })
			.withMessage("Discount percentage must be between 1 and 80"),
		body("availableUntil")
			.optional()
			.isISO8601()
			.withMessage("Enter a valid date"),
	],
};

// Exports the validator
module.exports = discountValidator;
