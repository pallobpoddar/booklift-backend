/*
 * Filename: authValidation.js
 * Author: Pallob Poddar
 * Date: October 14, 2023
 * Description: This module is a middleware which authenticates the signup and signin credentials
 */

// Imports necessary modules
const { body } = require("express-validator");

/**
 * Validator function to validate email
 * @param {*} message
 * @returns email validation
 */
const validateEmail = (message) => {
	return body("email")
		.exists()
		.withMessage("Email is required")
		.bail()
		.isEmail()
		.withMessage(message);
};

/**
 * Validator function to validate password
 * @param {*} message
 * @returns password validation
 */
const validatePassword = (message) => {
	return body("password")
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
		.withMessage(message);
};

// Signup and signin array validate the required fields given from request body
const authValidator = {
	signup: [
		validateEmail("Invalid email"),
		validatePassword("Invalid password"),
		body("confirmPassword")
			.exists()
			.withMessage("Confirm password is required")
			.bail()
			.custom((value, { req }) => {
				if (value !== req.body.password) {
					throw new Error("Passwords don't match");
				}
				return true;
			}),
		body("name")
			.exists()
			.withMessage("Name is required")
			.bail()
			.isString()
			.withMessage("Invalid name")
			.bail()
			.trim()
			.notEmpty()
			.withMessage("Name is required")
			.bail()
			.isLength({ max: 50 })
			.withMessage("Character limit exceeded"),
		body("phone")
			.exists()
			.withMessage("Phone number is required")
			.bail()
			.isMobilePhone("bn-BD")
			.withMessage("Invalid phone number"),
		body("dateOfBirth")
			.optional()
			.isISO8601()
			.withMessage("Invalid date of birth"),
		body("gender")
			.optional()
			.isIn(["Male", "Female", "Non-binary"])
			.withMessage("Gender can be Male, Female or Non-binary"),
	],

	signin: [
		validateEmail("Incorrect email or password"),
		validatePassword("Incorrect email or password"),
	],
};

// Exports the validator
module.exports = authValidator;
