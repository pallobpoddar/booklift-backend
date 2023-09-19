/*
 * Filename: transaction.js
 * Author: Pallob Poddar
 * Date: September 19, 2023
 * Description: This module defines the transactions collection schema
 */

// Imports necessary modules
const mongoose = require("mongoose");

// Creates a transaction schema with necessary fields
const transactionSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Types.ObjectId,
			ref: "User",
			required: true,
		},
		books: {
			type: [
				{
					book: {
						type: mongoose.Types.ObjectId,
						ref: "Product",
						required: true,
					},
					quantity: Number,
					_id: false,
				},
			],
		},
		total: {
			type: Number,
			required: true,
		},
	},
	{ timestamps: true }
);

// Creates a model with the transaction schema and exports it
const transaction = mongoose.model("Transaction", transactionSchema);
module.exports = transaction;
