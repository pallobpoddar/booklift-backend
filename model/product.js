const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: [true, "Title was not provided"],
			maxLength: 30,
		},
		price: {
			type: Number,
			required: [true, "Price was not provided"],
		},
		category: {
			type: String,
			required: [true, "Category was not provided"],
		},
	},
	{ timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
