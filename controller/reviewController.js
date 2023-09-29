/*
 * Filename: reviewController.js
 * Author: Pallob Poddar
 * Date: September 19, 2023
 * Description: This module connects the review model and sends appropriate responses
 */

// Imports necessary modules
const { validationResult } = require("express-validator");
const HTTP_STATUS = require("../constants/statusCodes");
const sendResponse = require("../util/common");
const userModel = require("../model/user");
const bookModel = require("../model/book");
const reviewModel = require("../model/review");

/**
 * Represents a review controller
 * @class
 */
class ReviewController {
	/**
	 * Create function to add a review
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
					"Failed to add a review",
					validation
				);
			}

			// Destructures necessary elements from request body
			const { userId, bookId, rating, review } = req.body;

			// If the user is not registered, it returns an error
			const user = await userModel.findById({ _id: userId });
			if (!user) {
				return sendResponse(
					res,
					HTTP_STATUS.UNAUTHORIZED,
					"You are not registered",
					"Unauthorized"
				);
			}

			// If the book is not registered, it returns an error
			const book = await bookModel.findById({ _id: bookId });
			if (!book) {
				return sendResponse(
					res,
					HTTP_STATUS.NOT_FOUND,
					"Book is not registered",
					"Not found"
				);
			}

			// Creates a review document
			const userReview = await reviewModel.create({
				user: userId,
				book: bookId,
				rating: rating,
				review: review,
			});

			// Converts the mongoDB document to a javascript object	and deletes unnecessary fields
			const reviewFilteredInfo = userReview.toObject();
			delete reviewFilteredInfo._id;
			delete reviewFilteredInfo.createdAt;
			delete reviewFilteredInfo.updatedAt;
			delete reviewFilteredInfo.__v;

			// Returns book data
			return sendResponse(
				res,
				HTTP_STATUS.OK,
				"Successfully added the review",
				reviewFilteredInfo
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
					"Failed to edit a review",
					validation
				);
			}

			// Destructures necessary elements from request body
			const { reviewId, rating, review } = req.body;

			const updatedReview = await reviewModel.findByIdAndUpdate(
				{ _id: reviewId },
				{ rating: rating, review: review },
				{ new: true }
			);

			// Converts the mongoDB document to a javascript object	and deletes unnecessary fields
			const reviewFilteredInfo = updatedReview.toObject();
			delete reviewFilteredInfo._id;
			delete reviewFilteredInfo.createdAt;
			delete reviewFilteredInfo.updatedAt;
			delete reviewFilteredInfo.__v;

			// Returns book data
			return sendResponse(
				res,
				HTTP_STATUS.OK,
				"Successfully updated the review",
				reviewFilteredInfo
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

// Exports the review controller
module.exports = new ReviewController();
