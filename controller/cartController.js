/*
 * Filename: cartController.js
 * Author: Pallob Poddar
 * Date: September 18, 2023
 * Description: This module connects the cart model and sends appropriate responses
 */

// Imports necessary modules
const { validationResult } = require("express-validator");
const sendResponse = require("../util/common");
const cartModel = require("../model/cart");
const userModel = require("../model/user");
const bookModel = require("../model/book");
const transactionModel = require("../model/transaction");
const HTTP_STATUS = require("../constants/statusCodes");

class CartController {
	async add(req, res) {
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
			const { userId, productId, quantity } = req.body;

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
			const book = await bookModel.findById({ _id: productId });
			if (!book) {
				return sendResponse(
					res,
					HTTP_STATUS.NOT_FOUND,
					"Book is not registered",
					"Not found"
				);
			}

			// Converts the mongoDB document to a javascript object	and deletes unnecessary fields
			const bookObject = book.toObject();
			let cartObject = await cartModel.findById({ user: userId });
			if (!cartObject) {
				const cart = new cartModel({
					user: userId,
					products: {
						book: productId,
						quantity: quantity,
					},
					total: bookObject.price * quantity,
				});

				await cart
					.save()
					.then((data) => {
						return res
							.status(HTTP_STATUS.OK)
							.send(success("Successfully created a cart", data));
					})
					.catch((error) => {
						return res
							.status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
							.send(failure("Failed to create a cart"));
					});
			} else {
				let removeFlag = false;
				let responseFlag = false;
				cartObject.products.forEach((data) => {
					const productIdToString = String(data.book);
					if (productIdToString === productId) {
						removeFlag = true;
						if (data.quantity + quantity <= bookObject.stock) {
							data.quantity = data.quantity + quantity;
						} else {
							responseFlag = true;
						}
					}
				});

				if (responseFlag === true) {
					return res.status(HTTP_STATUS.OK).send(failure("Not enough stock"));
				}

				if (removeFlag === false) {
					const newProduct = {
						book: productId,
						quantity: quantity,
					};
					cartObject.products.push(newProduct);
				}
				cartObject.total = cartObject.total + bookObject.price * quantity;
				await cartObject
					.save()
					.then((data) => {
						return res
							.status(HTTP_STATUS.OK)
							.send(success("Added items to the cart", data));
					})
					.catch((error) => {
						return res
							.status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
							.send(failure("Failed to add items to the cart"));
					});
			}
		} catch (error) {
			return res
				.status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
				.send(failure("Internal server error"));
		}
	}

	async removeItems(req, res) {
		try {
			const validation = validationResult(req).array();
			if (validation.length > 0) {
				return res
					.status(HTTP_STATUS.OK)
					.send(failure("Failed to remove items", validation));
			}

			const { userId, productId, quantity } = req.body;

			const user = await userModel.findById({ _id: userId });
			if (!user) {
				return res
					.status(HTTP_STATUS.OK)
					.send(failure("You are not registered"));
			}

			const book = await bookModel.findById({ _id: productId });
			if (!book) {
				return res.status(HTTP_STATUS.OK).send(failure("There's no such book"));
			}
			const bookObject = book.toObject();
			let cartObject = await cartModel.findById({ user: userId });
			if (!cartObject) {
				return res
					.status(HTTP_STATUS.OK)
					.send(failure("You don't have a cart"));
			} else {
				let removeFlag = false;
				let responseFlag = false;
				cartObject.products.forEach((data) => {
					const productIdToString = String(data.book);
					if (productIdToString === productId) {
						removeFlag = true;
						if (data.quantity - quantity >= 0) {
							data.quantity = data.quantity - quantity;
						} else {
							responseFlag = true;
						}
					}
				});

				if (responseFlag === true) {
					return res
						.status(HTTP_STATUS.OK)
						.send(failure("Number of items should be at least 0"));
				}

				if (removeFlag === false) {
					return res
						.status(HTTP_STATUS.OK)
						.send(failure("You don't have this book in your cart"));
				}

				cartObject.total = cartObject.total - bookObject.price * quantity;
				await cartObject
					.save()
					.then((data) => {
						return res
							.status(HTTP_STATUS.OK)
							.send(success("Removed items from the cart", data));
					})
					.catch((error) => {
						return res
							.status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
							.send(failure("Failed to remove items from the cart"));
					});
			}
		} catch (error) {
			return res
				.status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
				.send(failure("Internal server error"));
		}
	}

	async checkout(req, res) {
		try {
			const validation = validationResult(req).array();
			if (validation.length > 0) {
				return res
					.status(HTTP_STATUS.OK)
					.send(failure("Failed to checkout", validation));
			}

			const { cartId } = req.body;
			const cart = await cartModel.findById({ _id: cartId });
			if (!cart) {
				return res.status(HTTP_STATUS.OK).send(failure("There's no such cart"));
			} else {
			}

			const cartObject = cart.toObject();
			const transaction = new transactionModel({
				cart: cartId,
				user: cartObject.user,
				products: cartObject.products,
				total: cartObject.total,
			});

			await transaction
				.save()
				.then((data) => {
					return res
						.status(HTTP_STATUS.OK)
						.send(success("Successfully created a transaction", data));
				})
				.catch((error) => {
					return res
						.status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
						.send(failure("Failed to create a transaction"));
				});
		} catch (error) {
			return res
				.status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
				.send(failure("Internal server error"));
		}
	}
}

module.exports = new CartController();
