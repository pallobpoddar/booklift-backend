const express = require("express");
const app = express();
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const cors = require("cors");
const multer = require("multer");
const HTTP_STATUS = require("./constants/statusCodes");
const sendResponse = require("./util/commonResponse");
const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");
const bookRouter = require("./routes/bookRoutes");
const discountRouter = require("./routes/discountRoutes");
const transactionRouter = require("./routes/transactionRoutes");
const cartRouter = require("./routes/cartRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const balanceRouter = require("./routes/balanceRoutes");
const fileRouter = require("./routes/fileRoutes");
const databaseConnection = require("./config/database");

const accessLogStream = fs.createWriteStream(
	path.join(__dirname, "logFile.log"),
	{ flags: "a" }
);

dotenv.config();
const port = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.use((err, req, res, next) => {
	if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
		return sendResponse(
			res,
			HTTP_STATUS.BAD_REQUEST,
			"Invalid JSON error",
			"Bad request"
		);
	}
	next();
});
app.use(morgan("combined", { stream: accessLogStream }));
app.use("/api/auths", authRouter);
app.use("/api/users", userRouter);
app.use("/api/books", bookRouter);
app.use("/api/transactions", transactionRouter);
app.use("/api/carts", cartRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/discounts", discountRouter);
app.use("/api/balances", balanceRouter);
app.use("/api/files", fileRouter);
app.use(async (req, res) => {
	return sendResponse(
		res,
		HTTP_STATUS.NOT_FOUND,
		"Page not found",
		"Not found"
	);
});
app.use((err, req, res, next) => {
	console.log(err);
	if (err instanceof multer.MulterError) {
		return sendResponse(res, 404, err.message);
	} else {
		next(err);
	}
});

databaseConnection(() => {
	app.listen(port, () => {
		console.log(`Server is running on ${port}`);
	});
});
