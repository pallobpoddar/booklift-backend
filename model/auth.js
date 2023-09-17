/*
 * Filename: auth.js
 * Author: Pallob Poddar
 * Date: September 15, 2023
 * Description: This module defines the auths collection schema
 */

// Imports necessary modules
const mongoose = require("mongoose");

// Creates a auth schema with necessary fields
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

// Creates a model with the auth schema and exports it
const Auth = mongoose.model("Auth", authSchema);
module.exports = Auth;
