/*
 * Filename: bookController.js
 * Author: Pallob Poddar
 * Date: September 17, 2023
 * Description: This module connects the book model and sends appropriate responses
 */

// Imports necessary modules
const { validationResult } = require("express-validator");
const bookModel = require("../model/book");
const HTTP_STATUS = require("../constants/statusCodes");
const sendResponse = require("../util/common");

/**
 * Represents a book controller
 * @class
 */
class bookController {
	/**
	 * Create function to add a book's data
	 * @param {*} req
	 * @param {*} res
	 * @returns Response to the client
	 */
	async add(req, res) {
		try {
			// If the book provides invalid information, it returns an error
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
			const {
				title,
				author,
				description,
				price,
				discountPercentage,
				stock,
				language,
				category,
				year,
				isbn,
			} = req.body;

			// If the book is already registered, it returns an error
			const bookRegistered = await bookModel.findOne({ isbn: isbn });
			if (bookRegistered) {
				return sendResponse(
					res,
					HTTP_STATUS.CONFLICT,
					"Book already exists",
					"Conflict"
				);
			}

			// Creates a book document
			const book = await bookModel.create({
				title: title,
				author: author,
				year: year,
				description: description,
				language: language,
				category: category,
				isbn: isbn,
				price: price,
				discountPercentage: discountPercentage,
				stock: stock,
			});

			// Converts the mongoDB document to a javascript object	and deletes unnecessary fields
			const bookFilteredInfo = book.toObject();
			delete bookFilteredInfo._id;
			delete bookFilteredInfo.createdAt;
			delete bookFilteredInfo.updatedAt;
			delete bookFilteredInfo.__v;

			// Returns book data
			return sendResponse(
				res,
				HTTP_STATUS.OK,
				"Successfully added the book",
				bookFilteredInfo
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

	async getAll(req, res) {
		try {
			const {
				page,
				limit,
				title,
				author,
				year,
				description,
				language,
				category,
				isbn,
				price,
				priceFill,
				discountPercentage,
				discountPercentageFill,
				stock,
				stockFill,
				search,
				sortParam,
				sortOrder,
			} = req.query;
			if (page < 1 || limit < 0) {
				return res
					.status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
					.send(
						failure(
							"Page and limit values must be at least 1 and 0 respectively"
						)
					);
			}

			let filter = {};
			if (price) {
				if (priceFill === "low") {
					filter.price = { $lte: parseFloat(price) };
				} else if (priceFill === "high") {
					filter.price = { $gte: parseFloat(price) };
				}
			}
			if (discountPercentage) {
				if (discountPercentageFill === "low") {
					filter.discountPercentage = {
						$lte: parseFloat(discountPercentage),
					};
				} else if (discountPercentageFill === "high") {
					filter.discountPercentage = {
						$gte: parseFloat(discountPercentage),
					};
				}
			}
			if (rating) {
				if (ratingFill === "low") {
					filter.rating = { $lte: parseFloat(rating) };
				} else if (ratingFill === "high") {
					filter.rating = { $gte: parseFloat(rating) };
				}
			}
			if (stock) {
				if (stockFill === "low") {
					filter.stock = { $lte: parseFloat(stock) };
				} else if (stockFill === "high") {
					filter.stock = { $gte: parseFloat(stock) };
				}
			}
			if (brand) {
				filter.brand = { $regex: brand, $options: "i" };
			}
			if (category) {
				filter.category = category.toLowerCase();
			}
			if (search) {
				filter["$or"] = [
					{ title: { $regex: search, $options: "i" } },
					{ description: { $regex: search, $options: "i" } },
				];
			}
			if (!limit) {
				limit = 20;
			}
			if (limit > 50) {
				limit = 50;
			}
			if (!page) {
				page = 1;
			}

			let products;
			products = await bookModel
				.find(filter)
				.sort({
					[sortParam]: sortOrder === "asc" ? 1 : -1,
				})
				.skip((page - 1) * limit)
				.limit(limit);

			if (products.length === 0) {
				return res
					.status(HTTP_STATUS.NOT_FOUND)
					.send(failure("No products were found"));
			}

			return res.status(HTTP_STATUS.OK).send(
				success("Successfully got all products", {
					countPerPage: products.length,
					page: parseInt(page),
					limit: parseInt(limit),
					products: products,
				})
			);
		} catch (error) {
			console.log(error);
			return res
				.status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
				.send(failure("Internal server error"));
		}
	}

	/**
	 * Update function to update a book's data
	 * @param {*} req
	 * @param {*} res
	 * @returns Response to the client
	 */
	async updateOneByID(req, res) {
		try {
			// If the book provides invalid information, it returns an error
			const validation = validationResult(req).array();
			if (validation.length > 0) {
				return sendResponse(
					res,
					HTTP_STATUS.UNPROCESSABLE_ENTITY,
					"Failed to update the book",
					validation
				);
			}

			// Destructures necessary elements from request parameter and body
			const { id } = req.params;
			const {
				title,
				author,
				description,
				price,
				discountPercentage,
				stock,
				language,
				category,
				year,
				isbn,
			} = req.body;

			// If nothing was selected, it returns an error
			if (
				!title &&
				!author &&
				!description &&
				!price &&
				!discountPercentage &&
				!stock &&
				!language &&
				!category &&
				!year &&
				!isbn
			) {
				return sendResponse(
					res,
					HTTP_STATUS.BAD_REQUEST,
					"Invalid request",
					"Bad request"
				);
			}

			// Updates book data and unselects unnecessary fields
			const book = await bookModel
				.findByIdAndUpdate(
					{ _id: id },
					{
						title: title,
						author: author,
						description: description,
						price: price,
						discountPercentage: discountPercentage,
						stock: stock,
						language: language,
						category: category,
						year: year,
						isbn: year,
					},
					{
						new: true,
					}
				)
				.select("-_id -createdAt -updatedAt -__v");

			// If no book is found, it returns an error
			if (!book) {
				return sendResponse(
					res,
					HTTP_STATUS.NOT_FOUND,
					"Book is not registered",
					"Not found"
				);
			}

			// Otherwise returns book data as response
			return sendResponse(
				res,
				HTTP_STATUS.OK,
				"Successfully updated the book",
				book
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
	 * Delete function to delete a book's data
	 * @param {*} req
	 * @param {*} res
	 * @returns Response to the client
	 */
	async deleteOneByID(req, res) {
		try {
			// If the book provides invalid information, it returns an error
			const validation = validationResult(req).array();
			if (validation.length > 0) {
				return sendResponse(
					res,
					HTTP_STATUS.UNPROCESSABLE_ENTITY,
					"Failed to delete the book",
					validation
				);
			}

			// Destructures id from request parameter and deletes book data
			const { id } = req.params;
			const book = await bookModel.findByIdAndDelete({ _id: id });

			// If no book is found, it returns an error
			if (!book) {
				return sendResponse(
					res,
					HTTP_STATUS.NOT_FOUND,
					"Book is not registered",
					"Not found"
				);
			}

			// Otherwise returns a valid response
			return sendResponse(
				res,
				HTTP_STATUS.OK,
				`Successfully deleted the book with ${id} id`
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

// Exports the book controller
module.exports = new bookController();
