/*
 * Filename: cartController.js
 * Author: Pallob Poddar
 * Date: September 19, 2023
 * Description: This module connects the cart model and sends appropriate responses
 */

// Imports necessary modules
const { validationResult } = require("express-validator");
const sendResponse = require("../util/common");
const HTTP_STATUS = require("../constants/statusCodes");
const userModel = require("../model/user");
const bookModel = require("../model/book");
const discountModel = require("../model/discount");
const cartModel = require("../model/cart");

class CartController {
	/**
	 * Create and update function to add items in a cart
	 * @param {*} req
	 * @param {*} res
	 * @returns Response to the client
	 */
	async addItems(req, res) {
		try {
			// If the user provides invalid information, it returns an error
			const validation = validationResult(req).array();
			if (validation.length > 0) {
				return sendResponse(
					res,
					HTTP_STATUS.UNPROCESSABLE_ENTITY,
					"Failed to add the book",
					validation
				);
			}

			// Destructures necessary elements from request body
			const { userId, bookId, quantity } = req.body;

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

			// Checks if the book has any discount
			const discount = await discountModel.findOne({ book: bookId });

			// Converts the mongoDB document to a javascript object
			const bookObject = book.toObject();

			// If user doesn't have an existing cart, it creates one after calculating the total price
			let cartObject = await cartModel.findOne({ user: userId });
			if (!cartObject) {
				const cart = await cartModel.create({
					user: userId,
					books: {
						book: bookId,
						quantity: quantity,
					},
					total: discount
						? bookObject.price * quantity -
						  (bookObject.price * quantity * discount.percentage) /
								100
						: bookObject.price * quantity,
				});

				// Converts the mongoDB document to a javascript object	and deletes unnecessary fields
				const cartFilteredInfo = cart.toObject();
				delete cartFilteredInfo._id;
				delete cartFilteredInfo.createdAt;
				delete cartFilteredInfo.updatedAt;
				delete cartFilteredInfo.__v;

				// Returns cart data
				return sendResponse(
					res,
					HTTP_STATUS.OK,
					"Successfully added the cart",
					cartFilteredInfo
				);
			}

			// If stock is available, it adds the quantity for that book
			let removeFlag = false;
			let responseFlag = false;
			cartObject.books.forEach((data) => {
				const bookIdToString = String(data.book);
				if (bookIdToString === bookId) {
					removeFlag = true;
					if (data.quantity + quantity <= bookObject.stock) {
						data.quantity = data.quantity + quantity;
					} else {
						responseFlag = true;
					}
				}
			});

			// Otherwise it returns an error
			if (responseFlag === true) {
				return sendResponse(
					res,
					HTTP_STATUS.EXPECTATION_FAILED,
					"Not enough stock",
					"Expectation failed"
				);
			}

			// Pushes the book in books array
			if (removeFlag === false) {
				const newBook = {
					book: bookId,
					quantity: quantity,
				};
				cartObject.books.push(newBook);
			}

			// Calculates the total price and updates the cart document
			cartObject.total = discount
				? cartObject.total +
				  (bookObject.price * quantity -
						(bookObject.price * quantity * discount.percentage) /
							100)
				: cartObject.total + bookObject.price * quantity;
			await cartObject.save();

			// Converts the mongoDB document to a javascript object	and deletes unnecessary fields
			const cartFilteredInfo = cartObject.toObject();
			delete cartFilteredInfo._id;
			delete cartFilteredInfo.createdAt;
			delete cartFilteredInfo.updatedAt;
			delete cartFilteredInfo.__v;

			// Returns cart data
			return sendResponse(
				res,
				HTTP_STATUS.OK,
				"Added items to the cart",
				cartFilteredInfo
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
	 * Retrieve function to get the cart's data
	 * @param {*} req
	 * @param {*} res
	 * @returns Response to the client
	 */
	async getCart(req, res) {
		try {
			// If the user provides invalid information, it returns an error
			const validation = validationResult(req).array();
			if (validation.length > 0) {
				return sendResponse(
					res,
					HTTP_STATUS.UNPROCESSABLE_ENTITY,
					"Failed to get the cart",
					validation
				);
			}

			// Destructures user id from request params
			const { id } = req.params;

			// If the user is not registered, it returns an error
			const user = await userModel.findById({ _id: id });
			if (!user) {
				return sendResponse(
					res,
					HTTP_STATUS.NOT_FOUND,
					"User does not exist",
					"Not found"
				);
			}

			// Retrieves cart data and unselects unnecessary fields
			const cart = await cartModel
				.findOne({ user: id })
				.populate("books.book", "-createdAt -updatedAt -__v")
				.select("-createdAt -updatedAt -__v");

			// If the cart is not registered, it returns an error
			if (!cart) {
				return sendResponse(
					res,
					HTTP_STATUS.NOT_FOUND,
					"Cart does not exist for user",
					"Not found"
				);
			}

			// Otherwise returns the cart data
			return sendResponse(
				res,
				HTTP_STATUS.OK,
				"Successfully got cart for user",
				cart
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
	 * Delete function to remove items from a cart
	 * @param {*} req
	 * @param {*} res
	 * @returns Response to the client
	 */
	async removeItems(req, res) {
		try {
			// If the user provides invalid information, it returns an error
			const validation = validationResult(req).array();
			if (validation.length > 0) {
				return sendResponse(
					res,
					HTTP_STATUS.UNPROCESSABLE_ENTITY,
					"Failed to remove items",
					validation
				);
			}

			// Destructures necessary elements from request body
			const { userId, bookId, quantity } = req.body;

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

			// Checks if the book has any discount
			const discount = await discountModel.findOne({ book: bookId });

			// Converts the mongoDB document to a javascript object
			const bookObject = book.toObject();

			// If no cart is found, it returns an error
			let cartObject = await cartModel.findOne({ user: userId });
			if (!cartObject) {
				return sendResponse(
					res,
					HTTP_STATUS.NOT_FOUND,
					"You don't have a cart",
					"Not found"
				);
			}

			// Otherwise checks if quantity becomes greater than 0 or not
			let removeFlag = false;
			let responseFlag = false;
			cartObject.books.forEach((data) => {
				const bookIdToString = String(data.book);
				if (bookIdToString === bookId) {
					removeFlag = true;
					if (data.quantity - quantity >= 0) {
						data.quantity = data.quantity - quantity;
					} else {
						responseFlag = true;
					}
				}
			});

			// If quantity becomes 0, it returns an error
			if (responseFlag === true) {
				return res
					.status(HTTP_STATUS.OK)
					.send(failure("Number of items should be at least 0"));
			}

			// If user doesn't have this book in the cart, it returns an error
			if (removeFlag === false) {
				return res
					.status(HTTP_STATUS.OK)
					.send(failure("You don't have this book in your cart"));
			}

			// Calculates the total price and updates the cart document
			cartObject.total = discount
				? cartObject.total -
				  (bookObject.price * quantity -
						(bookObject.price * quantity * discount.percentage) /
							100)
				: cartObject.total - bookObject.price * quantity;
			await cartObject.save();

			// Converts the mongoDB document to a javascript object	and deletes unnecessary fields
			const cartFilteredInfo = cartObject.toObject();
			delete cartFilteredInfo._id;
			delete cartFilteredInfo.createdAt;
			delete cartFilteredInfo.updatedAt;
			delete cartFilteredInfo.__v;

			// Returns cart data
			return sendResponse(
				res,
				HTTP_STATUS.OK,
				"Successfully removed items from the cart",
				cartFilteredInfo
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

// Exports the cart controller
module.exports = new CartController();
