/*
 * Filename: authController.js
 * Author: Pallob Poddar
 * Date: October 14, 2023
 * Description: This module connects the user and auth model and sends appropriate responses
 */

// Imports necessary modules
const { validationResult } = require("express-validator");
const sendResponse = require("../util/commonResponse");
const HTTP_STATUS = require("../constants/statusCodes");
const userModel = require("../model/user");
const authModel = require("../model/auth");
const { deleteStatements } = require("../util/commonFunctions");
const bcrypt = require("bcrypt");
const jsonwebtoken = require("jsonwebtoken");

/**
 * Represents an authentication controller
 * @class
 */
class AuthController {
	/**
	 * Signup function for users
	 * @param {*} req
	 * @param {*} res
	 * @returns response to the client
	 */
	async signup(req, res) {
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
			const { email, password, name, phone, dateOfBirth, gender } =
				req.body;

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
			const hashedPassword = await bcrypt
				.hash(password, 10)
				.then((hash) => {
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
	}

	/**
	 * Signin function for users and admins
	 * @param {*} req
	 * @param {*} res
	 * @returns response to the client
	 */
	async signin(req, res) {
		try {
			// If the user provides invalid properties, it returns an error
			const allowedProperties = ["email", "password"];
			const unexpectedProps = Object.keys(req.body).filter(
				(key) => !allowedProperties.includes(key)
			);
			if (unexpectedProps.length > 0) {
				return sendResponse(
					res,
					HTTP_STATUS.UNPROCESSABLE_ENTITY,
					"Failed to sign in",
					`Unexpected properties: ${unexpectedProps.join(", ")}`
				);
			}

			// If the user provides invalid information, it returns an error
			const validation = validationResult(req).array();
			if (validation.length > 0) {
				return sendResponse(
					res,
					HTTP_STATUS.UNPROCESSABLE_ENTITY,
					"Failed to sign in",
					validation
				);
			}

			// Destructures necessary elements from request body
			const { email, password } = req.body;

			// Populates user data from auth model and discards unnecessary fields
			const auth = await authModel
				.findOne({ email: email })
				.populate("user", "-createdAt -updatedAt -__v")
				.select("-email -createdAt -updatedAt -__v");

			// If the user is not registered, it returns an error
			if (!auth) {
				return sendResponse(
					res,
					HTTP_STATUS.UNAUTHORIZED,
					"User is not registered",
					"Unauthorized"
				);
			}

			// Compares the user given password with hashed password using bcrypt
			const checkPassword = await bcrypt.compare(password, auth.password);

			// If passwords don't match, it increments failedAttempts by 1
			if (!checkPassword) {
				auth.failedAttempts += 1;

				// If failedAttempts is less than 5, it returns a response
				if (auth.failedAttempts < 5) {
					auth.save();
					return sendResponse(
						res,
						HTTP_STATUS.UNAUTHORIZED,
						"Invalid credentials",
						"Unauthorized"
					);
				}

				// If failedAttempts is greater than or equal to 5, it blocks the user login for an hour
				const blockedDuration = 60 * 60 * 1000;
				auth.blockedUntil = new Date(Date.now() + blockedDuration);
				auth.save();
				return sendResponse(
					res,
					HTTP_STATUS.FORBIDDEN,
					"Your signin access has been blocked for an hour",
					"Forbidden"
				);
			} else {
				/* If passwords match, it checks whether or not the blocked duration is over
				 * If it's over, it assigns failedAttempts and blockedUntil to 0 and null respectively
				 */
				if (
					auth.blockedUntil &&
					auth.blockedUntil <= new Date(Date.now())
				) {
					auth.failedAttempts = 0;
					auth.blockedUntil = null;
					auth.save();
				} else if (
					// If the blocked duration isn't over yet, it returns an error
					auth.blockedUntil &&
					auth.blockedUntil > new Date(Date.now())
				) {
					return sendResponse(
						res,
						HTTP_STATUS.FORBIDDEN,
						`Please sign in again at ${auth.blockedUntil}`,
						"Forbidden"
					);
				}

				// Converts the mongoDB document to a javascript object and deletes unnecessary fields
				const responseAuth = auth.toObject();
				delete responseAuth.password;
				delete responseAuth.failedAttempts;
				delete responseAuth.blockedUntil;

				// Generates a jwt with an expiry time of 1 hour
				const jwt = jsonwebtoken.sign(
					responseAuth,
					process.env.SECRET_KEY,
					{
						expiresIn: "1h",
					}
				);

				// Includes jwt to the javascript object
				responseAuth.token = jwt;

				// Returns user data
				return sendResponse(
					res,
					HTTP_STATUS.OK,
					"Successfully signed in",
					responseAuth
				);
			}
		} catch (error) {
			// Returns an error
			return sendResponse(
				res,
				HTTP_STATUS.INTERNAL_SERVER_ERROR,
				"Internal server error",
				"Server error"
			);
		}
	}
}

// Exports the authentication controller
module.exports = new AuthController();
