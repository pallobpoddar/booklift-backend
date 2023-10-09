/*
 * Filename: authValidation.js
 * Author: Pallob Poddar
 * Date: September 16, 2023
 * Description: This module is a middleware which authenticates the signup and login credentials
 */

// Imports necessary modules
const { body } = require("express-validator");

// The signup and login array validates the required fields given from request body
const authValidator = {
	signup: [
		body("email")
			.exists()
			.withMessage("Email is required")
			.bail()
			.isEmail()
			.withMessage("Email is not valid"),
		body("password")
			.exists()
			.withMessage("Password is required")
			.bail()
			.isStrongPassword({
				minLength: 8,
				minLowercase: 1,
				minUppercase: 1,
				minSymbols: 1,
				minNumbers: 1,
			})
			.withMessage(
				"Password must be at least 8 characters long with a lower and upper case letter, symbol and number"
			),
		body("confirmPassword")
			.exists()
			.withMessage("Confirm your password")
			.bail()
			.custom((value, { req }) => {
				if (value !== req.body.password) {
					throw new Error("Passwords don't match");
				}
				return true;
			}),
		body("name")
			.exists()
			.withMessage("Enter your name")
			.bail()
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
			.exists()
			.withMessage("Enter your phone number")
			.bail()
			.isMobilePhone("bn-BD")
			.withMessage("Phone number is not valid"),
		body("birthday")
			.optional()
			.isString()
			.withMessage("Enter a date of birth in this format, 'mm-dd-yyyy'")
			.bail()
			.trim()
			.isLength(10)
			.withMessage("Enter a date of birth in this format, 'mm-dd-yyyy'"),
		body("gender")
			.optional()
			.isIn(["Male", "Female", "Non-binary"])
			.withMessage("Gender can be Male, Female or Non-binary"),
	],

	login: [
		body("email")
			.exists()
			.withMessage("Email is required")
			.bail()
			.isEmail()
			.withMessage("Incorrect email or password"),
		body("password")
			.exists()
			.withMessage("Password is required")
			.bail()
			.isStrongPassword({
				minLength: 8,
				minLowercase: 1,
				minUppercase: 1,
				minSymbols: 1,
				minNumbers: 1,
			})
			.withMessage("Incorrect email or password"),
	],
};

// Exports the validator
module.exports = authValidator;
