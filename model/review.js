const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Types.ObjectId,
			ref: "User",
			required: [true, "User was not provided"],
		},
		product: {
			type: mongoose.Types.ObjectId,
			ref: "Product",
			required: [true, "Product was not provided"],
		},
		rating: {
			type: Number,
			required: [true, "Rating was not provided"],
		},
		review: {
			type: String,
			required: false,
		},
	},
	{ timestamps: true }
);

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
