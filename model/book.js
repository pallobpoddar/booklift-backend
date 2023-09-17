/*
 * Filename: book.js
 * Author: Pallob Poddar
 * Date: September 17, 2023
 * Description: This module defines the books collection schema
 */

// Imports necessary modules
const mongoose = require("mongoose");

// Creates a book schema with necessary fields
const bookSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
			maxLength: 100,
		},
		author: {
			type: String,
			required: true,
			maxLength: 30,
		},
		year: {
			type: Number,
			required: true,
		},
		description: {
			type: String,
			required: true,
			maxLength: 1000,
		},
		language: {
			type: String,
			required: true,
			maxLength: 30,
		},
		category: {
			type: String,
			required: true,
			maxLength: 50,
		},
		isbn: {
			type: Number,
			required: true,
			unique: true,
		},
		price: {
			type: Number,
			required: true,
		},
		discountPercentage: {
			type: Number,
			required: false,
		},
		stock: {
			type: Number,
			required: true,
		},
	},
	{ timestamps: true }
);

// Creates a model with the book schema and exports it
const book = mongoose.model("Book", bookSchema);
module.exports = book;
