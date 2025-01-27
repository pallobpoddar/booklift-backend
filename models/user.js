const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			maxLength: 100,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			maxLength: 100,
		},
		phone: {
			type: String,
			maxLength: 20,
		},
		address: {
			type: String,
			maxLength: 200,
		}
	},
	{ timestamps: true }
);

const user = mongoose.model("User", userSchema);
module.exports = user;
