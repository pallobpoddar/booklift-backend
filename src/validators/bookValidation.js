/*
 * Filename: bookValidation.js
 * Author: Pallob Poddar
 * Date: September 18, 2023
 * Description: This module is a middleware which authenticates the book credentials
 */

// Imports necessary modules
const { check, body, param, query } = require("express-validator");

// The bookAdd, paramCheck, commonValidation arrays validate the required fields given from request body, parameter and query
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

	commonValidation: [
		param("id").optional().isMongoId().withMessage("Enter a valid MongoDB Id"),
		query("page")
			.optional()
			.isInt({ min: 1, max: 100 })
			.withMessage("Page number must be between 1 and 100"),
		query("limit")
			.optional()
			.isInt({ min: 0, max: 50 })
			.withMessage("Limit must be between 0 and 50"),
		check("title")
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
		check("author")
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
		check("year")
			.optional()
			.isInt({ min: 1, max: 2023 })
			.withMessage("Enter a valid publication year"),
		query("yearFill")
			.optional()
			.isIn(["high", "low"])
			.withMessage("Year Fill can only be high or low"),
		check("description")
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
		check("language")
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
		check("category")
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
		check("isbn").optional().isISBN().withMessage("Enter a valid ISBN number"),
		check("price")
			.optional()
			.isFloat({ min: 10, max: 10000 })
			.withMessage("Price must be between 10 and 10000"),
		query("priceFill")
			.optional()
			.isIn(["high", "low"])
			.withMessage("Price Fill can only be high or low"),
		check("discountPercentage")
			.optional()
			.isFloat({ min: 1, max: 80 })
			.withMessage("Discount percentage must be between 1 and 80"),
		check("stock")
			.optional()
			.isInt({ min: 1, max: 10000 })
			.withMessage("Stock must be between 1 and 10000"),
		query("stockFill")
			.optional()
			.isIn(["high", "low"])
			.withMessage("Stock Fill can only be high or low"),
		query("search")
			.optional()
			.isString()
			.withMessage("Search must be in words")
			.bail()
			.trim()
			.notEmpty()
			.withMessage("Search can't be empty")
			.bail()
			.isLength({ max: 50 })
			.withMessage("Search must be within 50 characters"),
		query("sortParam")
			.optional()
			.isIn(["year", "price", "stock"])
			.withMessage("Only year, price and stock can be sorted"),
		query("sortOrder")
			.optional()
			.isIn(["asc", "dsc"])
			.withMessage("Sort order can only be asc or dsc"),
	],
};

// Exports the validator
module.exports = bookValidator;
