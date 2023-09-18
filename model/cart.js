/*
 * Filename: cart.js
 * Author: Pallob Poddar
 * Date: September 18, 2023
 * Description: This module defines the carts collection schema
 */

// Imports necessary modules
const mongoose = require("mongoose");

// Creates a cart schema with necessary fields
const cartSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Types.ObjectId,
			ref: "User",
			required: true,
		},
		products: {
			type: [
				{
					product: {
						type: mongoose.Types.ObjectId,
						ref: "Product",
						required: true,
					},
					quantity: Number,
					_id: false,
				},
			],
		},
		total: { type: Number, required: true },
	},
	{ timestamps: true }
);

// Creates a model with the cart schema and exports it
const cart = mongoose.model("Cart", cartSchema);
module.exports = cart;
