const jsonwebtoken = require("jsonwebtoken");
const HTTP_STATUS = require("../constants/statusCodes");
const { failure } = require("../util/common");
const authModel = require("../model/auth");

const isAuthorized = (req, res, next) => {
	try {
		if (!req.headers.authorization) {
			return res
				.status(HTTP_STATUS.UNAUTHORIZED)
				.send(failure("Unauthorized access"));
		}
		const jwt = req.headers.authorization.split(" ")[1];
		const validate = jsonwebtoken.verify(jwt, process.env.SECRET_KEY);
		if (validate) {
			next();
		} else {
			throw new Error();
		}
	} catch (error) {
		if (error instanceof jsonwebtoken.JsonWebTokenError) {
			return res
				.status(HTTP_STATUS.UNAUTHORIZED)
				.send(failure("Token invalid"));
		}
		if (error instanceof jsonwebtoken.TokenExpiredError) {
			return res
				.status(HTTP_STATUS.UNAUTHORIZED)
				.send(failure("Token expired"));
		}
	}
};

const isAdmin = (req, res, next) => {
	const jwt = req.headers.authorization.split(" ")[1];
	const user = jsonwebtoken.decode(jwt);
	if (user.role !== 1) {
		return res.status(HTTP_STATUS.UNAUTHORIZED).send(failure("Access denied"));
	}
	next();
};

module.exports = { isAuthorized, isAdmin };
