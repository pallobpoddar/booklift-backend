/*
 * Filename: userController.js
 * Author: Pallob Poddar
 * Date: October 15, 2023
 * Description: This module connects the user model and sends appropriate responses
 */

// Imports necessary modules
const userModel = require("../model/user");
const sendResponse = require("../utils/commonResponse");
const HTTP_STATUS = require("../constants/statusCodes");
const { validationResult } = require("express-validator");

/**
 * Represents a user controller
 * @class
 */
class UserController {
	/**
	 * Retrieve function to get all users' data
	 * @param {*} req
	 * @param {*} res
	 * @returns Response to the client
	 */
	async getAll(req, res) {
		try {
			// Retrieves all users' data after unselecting unnecessary fields
			const users = await userModel
				.find({})
				.select("-createdAt -updatedAt -__v");

			// If no user is found, it returns a response
			if (users.length === 0) {
				return sendResponse(res, HTTP_STATUS.OK, "No user is found");
			}

			// Otherwise returns users' data and total length as response
			return sendResponse(
				res,
				HTTP_STATUS.OK,
				"Successfully received all users",
				{
					result: users,
					total: users.length,
				}
			);
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
	 * Update function to update a user's data
	 * @param {*} req
	 * @param {*} res
	 * @returns Response to the client
	 */
	async updateOneByID(req, res) {
		try {
			// If the user provides invalid information, it returns an error
			const validation = validationResult(req).array();
			if (validation.length > 0) {
				return sendResponse(
					res,
					HTTP_STATUS.UNPROCESSABLE_ENTITY,
					"Failed to update the user",
					validation
				);
			}

			// Destructures necessary elements from request parameter and body
			const { id } = req.params;
			const { name, phone, birthday, gender } = req.body;

			// If nothing was selected, it returns an error
			if (!name && !phone && !birthday && !gender) {
				return sendResponse(
					res,
					HTTP_STATUS.BAD_REQUEST,
					"Invalid request",
					"Bad request"
				);
			}

			const image = req.file.path.replace(/\\/g, "/");

			// Updates user data and unselects unnecessary fields
			const user = await userModel
				.findByIdAndUpdate(
					{ _id: id },
					{
						name: name,
						phone: phone,
						birthday: birthday,
						gender: gender,
						image: image,
					},
					{ new: true }
				)
				.select("-_id -createdAt -updatedAt -__v");

			// If no user is found, it returns an error
			if (!user) {
				return sendResponse(
					res,
					HTTP_STATUS.NOT_FOUND,
					"User is not registered",
					"Not found"
				);
			}

			// Otherwise returns user data as response
			return sendResponse(
				res,
				HTTP_STATUS.OK,
				"Successfully updated the user",
				user
			);
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
	 * Delete function to delete a user's data
	 * @param {*} req
	 * @param {*} res
	 * @returns Response to the client
	 */
	async deleteOneByID(req, res) {
		try {
			// If the user provides invalid information, it returns an error
			const validation = validationResult(req).array();
			if (validation.length > 0) {
				return sendResponse(
					res,
					HTTP_STATUS.UNPROCESSABLE_ENTITY,
					"Failed to delete the user",
					validation
				);
			}

			// Destructures id from request parameter and deletes user data
			const { id } = req.params;
			const user = await userModel.findByIdAndDelete({ _id: id });

			// If no user is found, it returns an error
			if (!user) {
				return sendResponse(
					res,
					HTTP_STATUS.NOT_FOUND,
					"User is not registered",
					"Not found"
				);
			}

			// Otherwise returns a valid response
			return sendResponse(
				res,
				HTTP_STATUS.OK,
				`Successfully deleted the user with ${id} id`
			);
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

// Exports the user controller
module.exports = new UserController();
