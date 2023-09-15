/*
 * Filename: login-validation.js
 * Author: Pallob Poddar
 * Date: September 15, 2023
 * Description: This module is a middleware which authenticates the login credentials
 */

// Imports necessary modules
const jsonwebtoken = require("jsonwebtoken");
const HTTP_STATUS = require("../constants/statusCodes");
const sendResponse = require("../util/common");

/**
 * Authentication function for the users
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns Response to the client
 */
const isAuthenticated = (req, res, next) => {
	try {
		if (!req.headers.authorization) {
			return sendResponse(
				res,
				HTTP_STATUS.UNAUTHORIZED,
				"Unauthorized access",
				"Unauthorized"
			);
		}
		const jwt = req.headers.authorization.split(" ")[1];
		const validate = jsonwebtoken.verify(jwt, process.env.SECRET_KEY);
		if (validate) {
			next();
		} else {
			throw new Error();
		}
	} catch (error) {
		if (error instanceof jsonwebtoken.TokenExpiredError) {
			return sendResponse(
				res,
				HTTP_STATUS.UNAUTHORIZED,
				"Token expired",
				"Unauthorized"
			);
		}
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

const isAuthorized = (req, res, next) => {
	const jwt = req.headers.authorization.split(" ")[1];
	const user = jsonwebtoken.decode(jwt);
	if (user.role !== 1) {
		return sendResponse(
			res,
			HTTP_STATUS.UNAUTHORIZED,
			"Access denied",
			"Unauthorized"
		);
	}
	next();
};

module.exports = { isAuthenticated, isAuthorized };
