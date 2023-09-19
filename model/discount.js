/*
 * Filename: discount.js
 * Author: Pallob Poddar
 * Date: September 19, 2023
 * Description: This module defines the discounts collection schema
 */

// Imports necessary modules
const mongoose = require("mongoose");

// Creates a discount schema with necessary fields
const discountSchema = new mongoose.Schema(
	{
		book: {
			type: mongoose.Types.ObjectId,
			ref: "Book",
			required: true,
		},
		percentage: {
			type: Number,
			required: true,
		},
		availableUntil: {
			type: Date,
			required: true,
		},
	},
	{ timestamps: true }
);

// Creates a model with the discount schema and exports it
const discount = mongoose.model("Discount", discountSchema);
module.exports = discount;
