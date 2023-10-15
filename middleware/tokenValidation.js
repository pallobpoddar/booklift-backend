/*
 * Filename: tokenValidation.js
 * Author: Pallob Poddar
 * Date: October 15, 2023
 * Description: This module is a middleware which authenticates and authorizes the token
 */

// Imports necessary modules
const sendResponse = require("../util/commonResponse");
const HTTP_STATUS = require("../constants/statusCodes");
const jsonwebtoken = require("jsonwebtoken");

/**
 * Authentication function for users
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns Response to the client
 */
const isAuthenticated = (req, res, next) => {
	try {
		// If bearer token doesn't exist, it returns an error
		if (!req.headers.authorization) {
			return sendResponse(
				res,
				HTTP_STATUS.UNAUTHORIZED,
				"Unauthorized access",
				"Unauthorized"
			);
		}

		// Splits the bearer token to find jwt
		const jwt = req.headers.authorization.split(" ")[1];

		// Verifies jwt and passes the middleware to the next process
		const validation = jsonwebtoken.verify(jwt, process.env.SECRET_KEY);
		if (validation) {
			next();
		} else {
			throw new Error();
		}
	} catch (error) {
		// If the token is expired, it returns an error
		if (error instanceof jsonwebtoken.TokenExpiredError) {
			return sendResponse(
				res,
				HTTP_STATUS.UNAUTHORIZED,
				"Token expired",
				"Unauthorized"
			);
		}

		// If the token is invalid, it returns an error
		if (error instanceof jsonwebtoken.JsonWebTokenError) {
			return sendResponse(
				res,
				HTTP_STATUS.UNAUTHORIZED,
				"Token invalid",
				"Unauthorized"
			);
		}
	}
};

/**
 * Authorization function for admins
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns Response to the client
 */
const isAuthorized = (req, res, next) => {
	try {
		// Splits the bearer token to find jwt
		const jwt = req.headers.authorization.split(" ")[1];

		// Decodes jwt to get the user payload
		const user = jsonwebtoken.decode(jwt);

		// If user is not an admin, it returns an error
		if (user.isAdmin !== true) {
			return sendResponse(
				res,
				HTTP_STATUS.UNAUTHORIZED,
				"Access denied",
				"Unauthorized"
			);
		}
		next();
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

// Exports the authentication and authorization middleware
module.exports = { isAuthenticated, isAuthorized };
