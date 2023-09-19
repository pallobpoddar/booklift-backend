const { validationResult } = require("express-validator");
const { success, failure } = require("../util/common");
const transactionModel = require("../model/transaction");
const cartModel = require("../model/cart");
const bookModel = require("../model/book");
const HTTP_STATUS = require("../constants/statusCodes");
const sendResponse = require("../util/common");

class Transaction {
	async getAll(req, res) {
		try {
			let transactions;
			transactions = await transactionModel
				.find({})
				.populate("users")
				.populate("books.id");

			if (transactions.length > 0) {
				return res.status(HTTP_STATUS.OK).send(
					success("Successfully received all transactions", {
						result: transactions,
						total: transactions.length,
					})
				);
			}
			return res
				.status(HTTP_STATUS.OK)
				.send(success("No transactions were found"));
		} catch (error) {
			console.log(error);
			return res
				.status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
				.send(failure("Internal server error"));
		}
	}

	async add(req, res) {
		try {
			// If the user provides invalid information, it returns an error
			const validation = validationResult(req).array();
			if (validation.length > 0) {
				return sendResponse(
					res,
					HTTP_STATUS.UNPROCESSABLE_ENTITY,
					"Failed to checkout",
					validation
				);
			}

			const { userId } = req.body;
			const cart = await cartModel.findOne({ user: userId });

			if (!cart) {
				return sendResponse(
					res,
					HTTP_STATUS.NOT_FOUND,
					"Cart was not found for this user",
					"Not found"
				);
			}
			const booksList = cart.books.map((element) => {
				return element.book;
			});

			const booksInCart = await bookModel.find({
				_id: {
					$in: booksList,
				},
			});

			if (booksList.length !== booksInCart.length) {
				return sendResponse(
					res,
					HTTP_STATUS.NOT_FOUND,
					"All books in cart do not exist"
				);
			}

			booksInCart.forEach((book) => {
				const bookFound = cart.books.findIndex(
					(cartItem) => String(cartItem.book._id) === String(book._id)
				);
				if (book.stock < cart.books[bookFound].quantity) {
					return sendResponse(
						res,
						HTTP_STATUS.NOT_FOUND,
						"Unable to check out at this time, book does not exist"
					);
				}
				book.stock -= cart.books[bookFound].quantity;
			});

			const bulk = [];
			booksInCart.map((element) => {
				bulk.push({
					updateOne: {
						filter: { _id: element },
						update: { $set: { stock: element.stock } },
					},
				});
			});

			const stockSave = await bookModel.bulkWrite(bulk);
			const newTransaction = await transactionModel.create({
				user: userId,
				books: cart.books,
				total: cart.total,
			});

			cart.books = [];
			cart.total = 0;
			const cartSave = await cart.save();

			if (cartSave && stockSave && newTransaction) {
				return sendResponse(
					res,
					HTTP_STATUS.OK,
					"Successfully checked out!",
					newTransaction
				);
			}

			return sendResponse(res, HTTP_STATUS.OK, "Something went wrong");
		} catch (error) {
			console.log(error);
			return sendResponse(
				res,
				HTTP_STATUS.INTERNAL_SERVER_ERROR,
				"Internal server error",
				"Server error"
			);
		}
	}
}

module.exports = new Transaction();
