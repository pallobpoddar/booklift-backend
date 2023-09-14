const express = require("express");
const transactionRoutes = express();
const transactionController = require("../controller/transactionController");
const { isAuthorized, isAdmin } = require("../middleware/login-validation");

transactionRoutes.post("/checkout", transactionController.create);
transactionRoutes.get(
	"/all",
	isAuthorized,
	isAdmin,
	transactionController.getAll
);

module.exports = transactionRoutes;
