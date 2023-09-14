const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jsonwebtoken = require("jsonwebtoken");
const HTTP_STATUS = require("../constants/statusCodes");
const sendResponse = require("../util/common");
const authModel = require("../model/auth");
const userModel = require("../model/user");

class AuthController {
	async signup(req, res) {
		try {
			const validation = validationResult(req).array();
			if (validation.length > 0) {
				return sendResponse(
					res,
					HTTP_STATUS.UNPROCESSABLE_ENTITY,
					"Failed to sign up",
					validation
				);
			}

			const { email, password, name, phone, birthday, gender } = req.body;

			const isRegistered = await userModel.findOne({ email: email });

			if (isRegistered) {
				return sendResponse(
					res,
					HTTP_STATUS.CONFLICT,
					"You are already registered",
					"Conflict"
				);
			} else {
				const hashedPassword = await bcrypt.hash(password, 10).then((hash) => {
					return hash;
				});

				const user = await userModel.create({
					name: name,
					email: email,
					phone: phone,
					birthday: birthday,
					gender: gender,
				});

				const userFilteredInfo = user.toObject();
				delete userFilteredInfo._id;
				delete userFilteredInfo.createdAt;
				delete userFilteredInfo.updatedAt;
				delete userFilteredInfo.__v;

				await authModel
					.create({
						email: email,
						password: hashedPassword,
						user: user._id,
					})
					.then((data) => {
						return sendResponse(
							res,
							HTTP_STATUS.OK,
							"Successfully signed up",
							userFilteredInfo
						);
					});
			}
		} catch (error) {
			return sendResponse(
				res,
				HTTP_STATUS.INTERNAL_SERVER_ERROR,
				"Internal server error"
			);
		}
	}

	async login(req, res) {
		const { email, password } = req.body;
		const auth = await authModel.findOne({ email: email }).populate("user");
		if (!auth) {
			return res.status(HTTP_STATUS.OK).send(failure("You are not registered"));
		}
		const checkPassword = await bcrypt.compare(password, auth.password);
		if (!checkPassword) {
			const failedAuth = await authModel.findOneAndUpdate(
				{ email: email },
				{ $inc: { failedAttempts: 1 } },
				{ new: true }
			);
			if (failedAuth.failedAttempts < 5) {
				return res.status(HTTP_STATUS.OK).send(failure("Invalid credentials"));
			}
			const blockedDuration = 60 * 60 * 1000;
			const blockedObject = await authModel.findOneAndUpdate(
				{ email: email },
				{ blockedUntil: new Date(Date.now() + blockedDuration) },
				{ new: true }
			);
			return res
				.status(HTTP_STATUS.OK)
				.send(failure("Your login access has been blocked"));
		} else {
			const successfulAuth = await authModel.findOneAndUpdate(
				{ email: email },
				{ failedAttempts: 0 },
				{ new: true }
			);

			const responseAuth = successfulAuth.toObject();
			delete responseAuth.password;
			delete responseAuth._id;

			const jwt = jsonwebtoken.sign(responseAuth, process.env.SECRET_KEY, {
				expiresIn: "1h",
			});
			responseAuth.token = jwt;

			return res
				.status(HTTP_STATUS.OK)
				.send(success("Successfully logged in", responseAuth));
		}
	}
}

module.exports = new AuthController();
