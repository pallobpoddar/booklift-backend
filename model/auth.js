const mongoose = require("mongoose");

const authSchema = new mongoose.Schema(
	{
		email: {
			type: String,
			required: true,
			unique: true,
			maxLength: 100,
		},
		password: {
			type: String,
			required: true,
			maxLength: 100,
		},
		user: {
			type: mongoose.Types.ObjectId,
			ref: "User",
			required: true,
		},
		isAdmin: {
			type: Boolean,
			default: false,
		},
		failedAttempts: {
			type: Number,
			default: 0,
		},
		blockedUntil: {
			type: Date || null,
			default: null,
		},
		resetPassword: {
			type: Boolean,
			default: false,
		},
		resetPasswordToken: {
			type: String || null,
			default: null,
		},
		resetPasswordExpire: {
			type: Date || null,
			default: null,
		},
	},
	{ timestamps: true }
);

const auth = mongoose.model("Auth", authSchema);
module.exports = auth;
