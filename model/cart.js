const mongoose = require("mongoose");

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

const Cart = mongoose.model("Cart", cartSchema);
module.exports = Cart;
