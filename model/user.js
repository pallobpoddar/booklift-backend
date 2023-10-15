/*
 * Filename: user.js
 * Author: Pallob Poddar
 * Date: September 15, 2023
 * Description: This module defines the users collection schema
 */

// Imports necessary modules
const mongoose = require("mongoose");

// Creates a user schema with necessary fields
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
			maxLength: 50,
		},
		phone: {
			type: String,
			required: true,
			unique: true,
			maxLength: 14,
		},
		dateOfBirth: {
			type: Date,
			required: false,
		},
		gender: {
			type: String,
			required: false,
			maxLength: 10,
		},
	},
	{ timestamps: true }
);

// Creates a model with the user schema and exports it
const user = mongoose.model("User", userSchema);
module.exports = user;
