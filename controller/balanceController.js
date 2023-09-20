/*
 * Filename: authController.js
 * Author: Pallob Poddar
 * Date: September 20, 2023
 * Description: This module connects the balance model and sends appropriate responses
 */

// Imports necessary modules
const { validationResult } = require("express-validator");
const sendResponse = require("../util/common");
const HTTP_STATUS = require("../constants/statusCodes");
const userModel = require("../model/user");
const balanceModel = require("../model/balance");

/**
 * Represents a balance controller
 * @class
 */
class BalanceController {
	/**
	 * Create function to add a balance
	 * @param {*} req
	 * @param {*} res
	 * @returns Response to the client
	 */
	async add(req, res) {
		try {
			// If the user provides invalid information, it returns an error
			const validation = validationResult(req).array();
			if (validation.length > 0) {
				return sendResponse(
					res,
					HTTP_STATUS.UNPROCESSABLE_ENTITY,
					"Failed to add the balance",
					validation
				);
			}

			// Destructures necessary elements from request body and params
			const { id } = req.params;
			const { balance } = req.body;

			// If the user is not registered, it returns an error
			const user = await userModel.findById({ _id: id });
			if (!user) {
				return sendResponse(
					res,
					HTTP_STATUS.UNAUTHORIZED,
					"You are not registered",
					"Unauthorized"
				);
			}

			// If user doesn't have an existing balance, it creates one
			const balanceObject = await balanceModel.find({ user: id });
			if (balanceObject.length === 0) {
				const balanceReturned = await balanceModel.create({
					user: id,
					balance: balance,
				});

				// Converts the mongoDB document to a javascript object	and deletes unnecessary fields
				const balanceFilteredInfo = balanceReturned.toObject();
				delete balanceFilteredInfo._id;
				delete balanceFilteredInfo.createdAt;
				delete balanceFilteredInfo.updatedAt;
				delete balanceFilteredInfo.__v;

				// Returns cart data
				return sendResponse(
					res,
					HTTP_STATUS.OK,
					"Successfully added the balance",
					balanceFilteredInfo
				);
			}

			// If existing balance is greater than the requesting one, it returns an error
			if (balance.balance > balance) {
				return sendResponse(
					res,
					HTTP_STATUS.REQUESTED_RANGE_NOT_SATISFIABLE,
					"You can only add to your balance",
					"Not satisfiable"
				);
			}

			const newBalance = await balanceModel.findOneAndUpdate(
				{ user: id },
				{ balance: balance },
				{ new: true }
			);
			return sendResponse(
				res,
				HTTP_STATUS.OK,
				"Successfully updated the balance",
				newBalance
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

	async updateOneById(req, res) {
		try {
			// If the user provides invalid information, it returns an error
			const validation = validationResult(req).array();
			if (validation.length > 0) {
				return sendResponse(
					res,
					HTTP_STATUS.UNPROCESSABLE_ENTITY,
					"Failed to add the balance",
					validation
				);
			}

			// Destructures necessary elements from request body and params
			const { id } = req.params;
			const { balance } = req.body;

			// If the user is not registered, it returns an error
			const user = await userModel.findById({ _id: id });
			if (!user) {
				return sendResponse(
					res,
					HTTP_STATUS.UNAUTHORIZED,
					"You are not registered",
					"Unauthorized"
				);
			}

			const balanceObject = await balanceModel.findOne({ user: id });
			const balanceToObject = balanceObject.toObject();
			const updatedBalance = await balanceModel.findOneAndUpdate(
				{ user: id },
				{ balance: balanceToObject.balance + balance },
				{ new: true }
			);

			return sendResponse(
				res,
				HTTP_STATUS.OK,
				"Successfully updated the balance",
				updatedBalance
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

// Exports the balance controller
module.exports = new BalanceController();
