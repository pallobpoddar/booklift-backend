/*
 * Filename: common.js
 * Author: Pallob Poddar
 * Date: September 15, 2023
 * Description: This module sends a success or failure response
 */

/**
 * Response function to send the response
 * @param {*} res
 * @param {*} status
 * @param {*} message
 * @param {*} result
 */
const sendResponse = (res, status, message, result = null) => {
	const response = {};

	// If status code is greater than or equal to 400, it returns an error
	if (status >= 400) {
		response.success = false;
		response.message = "Internal server error";
		response.errors = result;
	} else {
		// Else returns the data
		response.success = true;
		response.message = "Successfully completed operations";
		response.data = result;
	}

	// Customizes the message and returns the response
	if (message) {
		response.message = message;
	}
	res.status(status).send(response);
};

// Exports the response function
module.exports = sendResponse;
