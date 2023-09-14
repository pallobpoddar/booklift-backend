const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			maxLength: 30,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		phone: {
			type: String,
			required: true,
			unique: true,
		},
		birthday: {
			type: String,
			required: false,
		},
		gender: {
			type: String,
			required: false,
		},
	},
	{ timestamps: true }
);

const user = mongoose.model("User", userSchema);
module.exports = user;
