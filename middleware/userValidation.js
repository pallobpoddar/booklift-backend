/*
 * Filename: userValidation.js
 * Author: Pallob Poddar
 * Date: September 16, 2023
 * Description: This module is a middleware which authenticates the user credentials
 */

// Imports necessary modules
const { body, param } = require("express-validator");

// The userUpdate and userDelete arrays validate the required fields given from request body and parameter
const userValidator = {
	userUpdate: [
		param("id").isMongoId().withMessage("Enter a valid MongoDB Id"),
		body("name")
			.optional()
			.isString()
			.withMessage("Name can't consist any number")
			.bail()
			.trim()
			.notEmpty()
			.withMessage("Name can't be empty")
			.bail()
			.isLength({ max: 30 })
			.withMessage("Name must be within 30 characters"),
		body("phone")
			.optional()
			.isMobilePhone("bn-BD")
			.withMessage("Phone number is not valid"),
		body("birthday").optional().isISO8601().withMessage("Enter a valid date"),
		body("gender")
			.optional()
			.isIn(["Male", "Female", "Non-binary"])
			.withMessage("Gender can be Male, Female or Non-binary"),
	],

	userDelete: [param("id").isMongoId().withMessage("Enter a valid MongoDB Id")],
};

// Exports the validator
module.exports = userValidator;
