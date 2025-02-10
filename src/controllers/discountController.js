/*
 * Filename: discountController.js
 * Author: Pallob Poddar
 * Date: September 19, 2023
 * Description: This module connects the discount model and sends appropriate responses
 */

// Imports necessary modules
const { validationResult } = require("express-validator");
const HTTP_STATUS = require("../constants/statusCodes");
const sendResponse = require("../utils/responseSender");
const bookModel = require("../models/book");
const discountModel = require("../models/discount");

/**
 * Represents a discount controller
 * @class
 */
class DiscountController {
  /**
   * Create function to add a discount's data
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
          "Failed to add a discount",
          validation
        );
      }

      // Destructures necessary elements from request body
      const { bookId, percentage, availableUntil } = req.body;

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

      // Creates a discount document
      const discount = await discountModel.create({
        book: bookId,
        percentage: percentage,
        availableUntil: availableUntil,
      });

      // Converts the mongoDB document to a javascript object	and deletes unnecessary fields
      const discountFilteredInfo = discount.toObject();
      delete discountFilteredInfo._id;
      delete discountFilteredInfo.createdAt;
      delete discountFilteredInfo.updatedAt;
      delete discountFilteredInfo.__v;

      // Returns discount data
      return sendResponse(
        res,
        HTTP_STATUS.OK,
        "Successfully added the discount",
        discountFilteredInfo
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
   * Update function to update a discount's data
   * @param {*} req
   * @param {*} res
   * @returns Response to the client
   */
  async updateOneById(req, res) {
    try {
      // If the book provides invalid information, it returns an error
      const validation = validationResult(req).array();
      if (validation.length > 0) {
        return sendResponse(
          res,
          HTTP_STATUS.UNPROCESSABLE_ENTITY,
          "Failed to update the discount",
          validation
        );
      }

      // Destructures necessary elements from request parameter and body
      const { id } = req.params;
      const { percentage, availableUntil } = req.body;

      // If nothing was selected, it returns an error
      if (!percentage && !availableUntil) {
        return sendResponse(
          res,
          HTTP_STATUS.BAD_REQUEST,
          "Invalid request",
          "Bad request"
        );
      }

      // Updates discount data and unselects unnecessary fields
      const discount = await discountModel
        .findByIdAndUpdate(
          { _id: id },
          {
            percentage: percentage,
            availableUntil: availableUntil,
          },
          { new: true }
        )
        .select("-_id -createdAt -updatedAt -__v");

      // If no discount is found, it returns an error
      if (!discount) {
        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "Discount is not registered",
          "Not found"
        );
      }

      // Otherwise returns discount data as response
      return sendResponse(
        res,
        HTTP_STATUS.OK,
        "Successfully updated the discount",
        discount
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

// Exports the discount controller
module.exports = new DiscountController();
