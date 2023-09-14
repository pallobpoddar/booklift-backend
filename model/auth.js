const mongoose = require("mongoose");

const authSchema = new mongoose.Schema(
	{
		email: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
		},
		user: {
			type: mongoose.Types.ObjectId,
			ref: "User",
			required: true,
		},
		role: {
			type: Number,
			required: false,
			default: 2,
		},
		failedAttempts: {
			type: Number,
			required: false,
			default: 0,
		},
		blockedUntil: {
			type: Date,
			required: false,
		}
	},
	{ timestamps: true }
);

const Auth = mongoose.model("Auth", authSchema);
module.exports = Auth;
