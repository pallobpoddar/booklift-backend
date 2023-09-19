/*
 * Filename: review.js
 * Author: Pallob Poddar
 * Date: September 19, 2023
 * Description: This module defines the reviews collection schema
 */

// Imports necessary modules
const mongoose = require("mongoose");

// Creates a review schema with necessary fields
const reviewSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Types.ObjectId,
			ref: "User",
			required: true,
		},
		book: {
			type: mongoose.Types.ObjectId,
			ref: "Book",
			required: true,
		},
		rating: {
			type: Number,
			required: true,
		},
		review: {
			type: String,
			required: false,
		},
	},
	{ timestamps: true }
);

// Creates a model with the review schema and exports it
const review = mongoose.model("Review", reviewSchema);
module.exports = review;
