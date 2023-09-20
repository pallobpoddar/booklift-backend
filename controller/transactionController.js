const { validationResult } = require("express-validator");
const sendResponse = require("../util/common");
const HTTP_STATUS = require("../constants/statusCodes");
const cartModel = require("../model/cart");
const bookModel = require("../model/book");
const transactionModel = require("../model/transaction");
const userModel = require("../model/user");
const balanceModel = require("../model/balance")

/**
 * Represents a cart controller
 * @class
 */
class TransactionController {
	/**
	 * Create function to add cart data
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
					"Failed to checkout",
					validation
				);
			}

			// Destructures user id from request body
			const { userId } = req.body;

			// If the cart is not registered, it returns an error
			const cart = await cartModel.findOne({ user: userId });
			if (!cart) {
				return sendResponse(
					res,
					HTTP_STATUS.NOT_FOUND,
					"Cart was not found for this user",
					"Not found"
				);
			}

			const balanceObject = await balanceModel.findOne({user: userId});
			if (balanceObject.balance < cart.total) {
				return sendResponse(res, HTTP_STATUS.CONFLICT, "You don't have sufficient balance", "Conflict");
			}

			// If any book is added in the cart but doesn't exist anymore, it returns an error
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
					"All books in cart do not exist",
					"Not found"
				);
			}

			// If stocks don't exist for selected books, it returns an error
			booksInCart.forEach((book) => {
				const bookFound = cart.books.findIndex(
					(cartItem) => String(cartItem.book._id) === String(book._id)
				);

				// Calculates the book stock
				book.stock -= cart.books[bookFound].quantity;
			});

			// Updates book stocks in a bulk
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

			// Creates a cart document
			const newTransaction = await transactionModel.create({
				user: userId,
				books: cart.books,
				total: cart.total,
			});

			// Converts the mongoDB document to a javascript object	and deletes unnecessary fields
			const transactionFilteredInfo = newTransaction.toObject();
			delete transactionFilteredInfo._id;
			delete transactionFilteredInfo.createdAt;
			delete transactionFilteredInfo.updatedAt;
			delete transactionFilteredInfo.__v;

			balanceObject.balance -= cart.total;
			const balanceSave = await balanceObject.save();

			// Updates the cart document
			cart.books = [];
			cart.total = 0;
			const cartSave = await cart.save();

			

			// If checkout is successful, it returns a response
			if (balanceSave && cartSave && stockSave && newTransaction) {
				return sendResponse(
					res,
					HTTP_STATUS.OK,
					"Successfully checked out",
					transactionFilteredInfo
				);
			}
		} catch (error) {
			console.log(error)
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
	 * Retrieve function to get all transactions' data
	 * @param {*} req
	 * @param {*} res
	 * @returns Response to the client
	 */
	async getAll(req, res) {
		try {
			// Retrieves all transactions' data after populating and unselecting unnecessary fields
			const transactions = await transactionModel
				.find({})
				.populate("user", "name email")
				.populate("books.book", "title description price")
				.select("-createdAt -updatedAt -__v");

			// If no cart is found, it returns a response
			if (transactions.length === 0) {
				return sendResponse(
					res,
					HTTP_STATUS.OK,
					"No transactions were found"
				);
			}

			// Otherwise returns transactions' data and total length as response
			return sendResponse(
				res,
				HTTP_STATUS.OK,
				"Successfully received all transactions",
				{
					result: transactions,
					total: transactions.length,
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
	 * Retrieve function to get transactions' data for user
	 * @param {*} req
	 * @param {*} res
	 * @returns Response to the client
	 */
	async getTransactions(req, res) {
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
					"User is not registered",
					"Not found"
				);
			}

			// Retrieves cart data and unselects unnecessary fields
			const carts = await transactionModel
				.find({ user: id })
				.populate("books.book", "-createdAt -updatedAt -__v")
				.select("-createdAt -updatedAt -__v");

			// If the cart is not registered, it returns an error
			if (!carts) {
				return sendResponse(
					res,
					HTTP_STATUS.NOT_FOUND,
					"Transaction is not registered for user",
					"Not found"
				);
			}

			// Otherwise returns the cart data
			return sendResponse(
				res,
				HTTP_STATUS.OK,
				"Successfully got carts for user",
				carts
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
module.exports = new TransactionController();
