/*
 * Filename: bookValidation.js
 * Author: Pallob Poddar
 * Date: September 17, 2023
 * Description: This module is a middleware which authenticates the book credentials
 */

// Imports necessary modules
const { body, param } = require("express-validator");

// The bookAdd, bookUpdate and bookDelete arrays validate the required fields given from request body and parameter
const bookValidator = {
	bookAdd: [
		body("title")
			.exists()
			.withMessage("Enter a title")
			.bail()
			.isString()
			.withMessage("Title must be in words")
			.bail()
			.trim()
			.notEmpty()
			.withMessage("Title can't be empty")
			.bail()
			.isLength({ max: 100 })
			.withMessage("Title must be within 100 characters"),
		body("author")
			.exists()
			.withMessage("Enter an author")
			.bail()
			.isString()
			.withMessage("Author must be in words")
			.bail()
			.trim()
			.notEmpty()
			.withMessage("Author can't be empty")
			.bail()
			.isLength({ max: 30 })
			.withMessage("Author must be within 30 characters"),
		body("year")
			.exists()
			.withMessage("Enter a publication year")
			.bail()
			.isInt({ min: 1, max: 2023 })
			.withMessage("Enter a valid publication year"),
		body("description")
			.exists()
			.withMessage("Enter a description")
			.bail()
			.isString()
			.withMessage("Description must be in words")
			.bail()
			.trim()
			.notEmpty()
			.withMessage("Description can't be empty")
			.bail()
			.isLength({ max: 1000 })
			.withMessage("Description must be within 1000 characters"),
		body("language")
			.exists()
			.withMessage("Enter a language")
			.bail()
			.isString()
			.withMessage("Language must be in words")
			.bail()
			.trim()
			.notEmpty()
			.withMessage("Language can't be empty")
			.bail()
			.isLength({ max: 30 })
			.withMessage("Language must be within 30 characters"),
		body("category")
			.exists()
			.withMessage("Enter a category")
			.bail()
			.isString()
			.withMessage("Category must be in words")
			.bail()
			.trim()
			.notEmpty()
			.withMessage("Category can't be empty")
			.bail()
			.isLength({ max: 50 })
			.withMessage("Category must be within 50 characters"),
		body("isbn")
			.exists()
			.withMessage("Enter an ISBN number")
			.bail()
			.isISBN()
			.withMessage("Enter a valid ISBN number"),
		body("price")
			.exists()
			.withMessage("Enter a price")
			.bail()
			.isFloat({ min: 10, max: 10000 })
			.withMessage("Price must be between 10 and 10000"),
		body("discountPercentage")
			.optional()
			.isFloat({ min: 1, max: 80 })
			.withMessage("Discount percentage must be between 1 and 80"),
		body("stock")
			.exists()
			.withMessage("Enter a stock")
			.bail()
			.isInt({ min: 1, max: 10000 })
			.withMessage("Stock must be between 1 and 10000"),
	],

	bookUpdate: [
		param("id").isMongoId().withMessage("Enter a valid MongoDB Id"),
		body("title")
			.optional()
			.isString()
			.withMessage("Title must be in words")
			.bail()
			.trim()
			.notEmpty()
			.withMessage("Title can't be empty")
			.bail()
			.isLength({ max: 100 })
			.withMessage("Title must be within 100 characters"),
		body("author")
			.optional()
			.isString()
			.withMessage("Author must be in words")
			.bail()
			.trim()
			.notEmpty()
			.withMessage("Author can't be empty")
			.bail()
			.isLength({ max: 30 })
			.withMessage("Author must be within 30 characters"),
		body("year")
			.optional()
			.isInt({ min: 1, max: 2023 })
			.withMessage("Enter a valid publication year"),
		body("description")
			.optional()
			.isString()
			.withMessage("Description must be in words")
			.bail()
			.trim()
			.notEmpty()
			.withMessage("Description can't be empty")
			.bail()
			.isLength({ max: 1000 })
			.withMessage("Description must be within 1000 characters"),
		body("language")
			.optional()
			.isString()
			.withMessage("Language must be in words")
			.bail()
			.trim()
			.notEmpty()
			.withMessage("Language can't be empty")
			.bail()
			.isLength({ max: 30 })
			.withMessage("Language must be within 30 characters"),
		body("category")
			.optional()
			.isString()
			.withMessage("Category must be in words")
			.bail()
			.trim()
			.notEmpty()
			.withMessage("Category can't be empty")
			.bail()
			.isLength({ max: 50 })
			.withMessage("Category must be within 50 characters"),
		body("isbn")
			.optional()
			.isISBN()
			.withMessage("Enter a valid ISBN number"),
		body("price")
			.optional()
			.isFloat({ min: 10, max: 10000 })
			.withMessage("Price must be between 10 and 10000"),
		body("discountPercentage")
			.optional()
			.isFloat({ min: 1, max: 80 })
			.withMessage("Discount percentage must be between 1 and 80"),
		body("stock")
			.optional()
			.isInt({ min: 1, max: 10000 })
			.withMessage("Stock must be between 1 and 10000"),
	],

	bookDelete: [
		param("id").isMongoId().withMessage("Enter a valid MongoDB Id"),
	],
};

// Exports the validator
module.exports = bookValidator;
