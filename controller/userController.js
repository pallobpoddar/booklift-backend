const { validationResult } = require("express-validator");
const sendResponse = require("../util/common");
const userModel = require("../model/user");
const HTTP_STATUS = require("../constants/statusCodes");

class UserController {
	async getAll(req, res) {
		try {
			await userModel
				.find({})
				.select("-_id -createdAt -updatedAt -__v")
				.then((users) => {
					return sendResponse(
						res,
						HTTP_STATUS.OK,
						"Successfully received all users",
						{
							result: users,
							total: users.length,
						}
					);
				})
				.catch((error) => {
					return sendResponse(res, HTTP_STATUS.OK, "No user is found");
				});
		} catch (error) {
			return sendResponse(
				res,
				HTTP_STATUS.INTERNAL_SERVER_ERROR,
				"Internal server error"
			);
		}
	}

	async getOneByID(req, res) {
		try {
			const { id } = req.params;
			await userModel
				.findById({ _id: id })
				.then((user) => {
					return res
						.status(HTTP_STATUS.OK)
						.send(success("Successfully received the user", user));
				})
				.catch((error) => {
					return res
						.status(HTTP_STATUS.OK)
						.send(failure("Failed to receive the user"));
				});
		} catch (error) {
			return res
				.status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
				.send(failure("Internal server error"));
		}
	}

	async updateOneByID(req, res) {
		try {
			const { id } = req.params;
			const updatedData = req.body;
			await userModel
				.findByIdAndUpdate(id, updatedData, {
					new: true,
				})
				.then((object) => {
					return res
						.status(HTTP_STATUS.OK)
						.send(success("Successfully updated the user"));
				})
				.catch((error) => {
					return res
						.status(HTTP_STATUS.OK)
						.send(success("Failed to receive the user"));
				});
		} catch (error) {
			return res
				.status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
				.send(failure("Internal server error"));
		}
	}

	async deleteOneByID(req, res) {
		try {
			const { id } = req.params;
			await userModel
				.findByIdAndDelete({ _id: id })
				.then((object) => {
					return res
						.status(HTTP_STATUS.OK)
						.send(success("Successfully deleted the user"));
				})
				.catch((error) => {
					return res
						.status(HTTP_STATUS.OK)
						.send(success("Failed to receive the user"));
				});
		} catch (error) {
			return res.status(500).send(failure("Internal server error"));
		}
	}

	async filterItems(req, res) {
		try {
			const queryParams = getQueryParams(req);
			for (const key in queryParams) {
				if (queryParams.hasOwnProperty(key)) {
					const newJsonObj = { [key]: queryParams[key] };
					console.log(newJsonObj);
				}
			}

			const filteredItems = await productModel.filterItems(queryParams);
			if (filteredItems)
				return res
					.status(200)
					.send(success("Successfully got the products", filteredItems));
			else return res.status(404).send(failure("Data not found", "404"));
		} catch (error) {
			return res.status(500).send(failure("Internal server error"));
		}
	}
}

module.exports = new UserController();
