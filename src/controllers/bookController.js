/*
 * Filename: bookController.js
 * Author: Pallob Poddar
 * Date: September 19, 2023
 * Description: This module connects the book model and sends appropriate responses
 */

// Imports necessary modules
const { validationResult } = require("express-validator");
const HTTP_STATUS = require("../constants/statusCodes");
const sendResponse = require("../utils/responseSender");
const bookModel = require("../models/book");

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
      // If the user provides invalid information, it returns an error
      // const validation = validationResult(req).array();
      // if (validation.length > 0) {
      // 	return sendResponse(
      // 		res,
      // 		HTTP_STATUS.UNPROCESSABLE_ENTITY,
      // 		"Failed to add the book",
      // 		validation
      // 	);
      // }

      // Destructures necessary elements from request body
      const {
        title,
        author,
        description,
        price,
        stock,
        language,
        category,
        year,
        isbn,
      } = req.body;

      // If the book is already registered, it returns an error
      // const bookRegistered = await bookModel.findOne({ isbn: isbn });
      // if (bookRegistered) {
      // 	return sendResponse(
      // 		res,
      // 		HTTP_STATUS.CONFLICT,
      // 		"Book already exists",
      // 		"Conflict"
      // 	);
      // }

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

  /**
   * Retrieve function to get all books' data
   * @param {*} req
   * @param {*} res
   * @returns Response to the client
   */
  async getAll(req, res) {
    try {
      // If the user provides invalid information, it returns an error
      // const validation = validationResult(req).array();
      // if (validation.length > 0) {
      // 	return sendResponse(
      // 		res,
      // 		HTTP_STATUS.UNPROCESSABLE_ENTITY,
      // 		"Failed to add the book",
      // 		validation
      // 	);
      // }

      // Destructures necessary elements from request query
      let {
        page,
        limit,
        author,
        year,
        yearFill,
        language,
        category,
        price,
        priceFill,
        stock,
        stockFill,
        search,
        sortParam,
        sortOrder,
      } = req.query;

      // Creates a filter object and adds filter to it dynamically
      let filter = {};
      if (author) {
        filter.author = { $regex: author, $options: "i" };
      }
      if (year && yearFill) {
        if (yearFill === "low") {
          filter.year = { $lte: parseInt(year) };
        } else if (yearFill === "high") {
          filter.year = { $gte: parseInt(year) };
        }
      } else if ((year && !yearFill) || (!year && yearFill)) {
        return sendResponse(
          res,
          HTTP_STATUS.UNPROCESSABLE_ENTITY,
          "Both year and yearFill need to be selected",
          "Unprocessable entity"
        );
      }
      if (language) {
        filter.language = { $regex: language, $options: "i" };
      }
      if (price) {
        if (priceFill === "low") {
          filter.price = { $lte: parseFloat(price) };
        } else if (priceFill === "high") {
          filter.price = { $gte: parseFloat(price) };
        }
      } else if ((price && !priceFill) || (!price && priceFill)) {
        return sendResponse(
          res,
          HTTP_STATUS.UNPROCESSABLE_ENTITY,
          "Both price and priceFill need to be selected",
          "Unprocessable entity"
        );
      }

      if (stock) {
        if (stockFill === "low") {
          filter.stock = { $lte: parseInt(stock) };
        } else if (stockFill === "high") {
          filter.stock = { $gte: parseInt(stock) };
        }
      } else if ((stock && !stockFill) || (!stock && stockFill)) {
        return sendResponse(
          res,
          HTTP_STATUS.UNPROCESSABLE_ENTITY,
          "Both stock and stockFill need to be selected",
          "Unprocessable entity"
        );
      }
      if (category) {
        filter.category = { $regex: category, $options: "i" };
      }
      if (search) {
        filter["$or"] = [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ];
      }
      if (!page) {
        page = 1;
      }
      if (!limit) {
        limit = 20;
      }

      // Retrieves book data, unselects unnecessary fields, set sort, skip and limit criteria according to the user needs.
      const books = await bookModel
        .find(filter)
        .select("-createdAt -updatedAt -__v")
        .sort({
          [sortParam]: sortOrder === "asc" ? 1 : -1,
        })
        .skip((page - 1) * limit)
        .limit(limit);

      // If no book is found, it returns an error
      if (books.length === 0) {
        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "No books were found",
          "Not found"
        );
      }

      // Otherwise returns count per page, page, limit and book data as response
      return sendResponse(res, HTTP_STATUS.OK, "Successfully got all books", {
        countPerPage: books.length,
        page: parseInt(page),
        limit: parseInt(limit),
        books: books,
      });
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

      // const object = JSON.parse(req.body);
      // Destructures necessary elements from request parameter and body
      const { id } = req.params;
      const {
        title,
        author,
        description,
        price,
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
