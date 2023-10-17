/*
 * Filename: commonFunctions.js
 * Author: Pallob Poddar
 * Date: October 17, 2023
 * Description: This is a helper module which minimizes number of lines
 */

// Imports necessary modules
const { validationResult } = require("express-validator");
const sendResponse = require("./commonResponse");
const HTTP_STATUS = require("../constants/statusCodes");
const userModel = require("../model/user");
const authModel = require("../model/auth");
const bcrypt = require("bcrypt");

/**
 * Helper function for user signup
 * @param {*} req
 * @param {*} res
 * @returns response to the client
 */
const signupHelper = async (req, res) => {
	try {
		// If the user provides invalid properties, it returns an error
		const allowedProperties = [
			"email",
			"password",
			"confirmPassword",
			"name",
			"phone",
			"dateOfBirth",
			"gender",
		];
		const unexpectedProps = Object.keys(req.body).filter(
			(key) => !allowedProperties.includes(key)
		);
		if (unexpectedProps.length > 0) {
			return sendResponse(
				res,
				HTTP_STATUS.UNPROCESSABLE_ENTITY,
				"Failed to sign up",
				`Unexpected properties: ${unexpectedProps.join(", ")}`
			);
		}

		// If the user provides invalid information, it returns an error
		const validation = validationResult(req).array();
		if (validation.length > 0) {
			return sendResponse(
				res,
				HTTP_STATUS.UNPROCESSABLE_ENTITY,
				"Failed to sign up",
				validation
			);
		}

		// Destructures necessary elements from request body
		const { email, password, name, phone, dateOfBirth, gender } = req.body;

		// If the user is already registered, it returns an error
		const isEmailRegistered = await userModel.findOne({ email: email });
		const isPhoneRegistered = await userModel.findOne({ phone: phone });
		if (isEmailRegistered) {
			return sendResponse(
				res,
				HTTP_STATUS.CONFLICT,
				"Email is already registered",
				"Conflict"
			);
		}
		if (isPhoneRegistered) {
			return sendResponse(
				res,
				HTTP_STATUS.CONFLICT,
				"Phone number is already registered",
				"Conflict"
			);
		}

		// Creates a user document
		const user = await userModel.create({
			name: name,
			email: email,
			phone: phone,
			dateOfBirth: dateOfBirth,
			gender: gender,
		});

		// Converts the mongoDB document to a javascript object	and deletes unnecessary fields
		const userFilteredInfo = deleteStatements(user);

		// Hashes the password
		const hashedPassword = await bcrypt.hash(password, 10).then((hash) => {
			return hash;
		});

		// Creates an auth document and returns user data
		await authModel
			.create({
				email: email,
				password: hashedPassword,
				user: user._id,
			})
			.then(() => {
				return sendResponse(
					res,
					HTTP_STATUS.OK,
					"Successfully signed up",
					userFilteredInfo
				);
			});
	} catch (error) {
		// Returns an error
		return sendResponse(
			res,
			HTTP_STATUS.INTERNAL_SERVER_ERROR,
			"Internal server error",
			"Server error"
		);
	}
};

/**
 * Delete function to delete unnecessary fields
 * @param {*} document
 * @returns a javascript object
 */
const deleteStatements = (document) => {
	const filteredInfo = document.toObject();
	delete filteredInfo.createdAt;
	delete filteredInfo.updatedAt;
	delete filteredInfo.__v;
	return filteredInfo;
};

// Exports the functions
module.exports = { deleteStatements, signupHelper };
