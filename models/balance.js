/*
 * Filename: cart.js
 * Author: Pallob Poddar
 * Date: September 20, 2023
 * Description: This module defines the carts collection schema
 */

// Imports necessary modules
const mongoose = require("mongoose");

// Creates a balance schema with necessary fields
const balanceSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Types.ObjectId,
			ref: "User",
			required: true,
			unique: true,
		},
		balance: {
			type: Number,
			required: true,
			default: 0,
		},
	},
	{ timestamps: true }
);

// Creates a model with the balance schema and exports it
const balance = mongoose.model("Balance", balanceSchema);
module.exports = balance;
