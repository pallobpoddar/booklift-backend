const { validationResult } = require("express-validator");
const { success, failure } = require("../util/common");
const userModel = require("../model/user");
const HTTP_STATUS = require("../constants/statusCodes");

class UserController {
	async create(req, res) {
		try {
			const validation = validationResult(req).array();
			if (validation.length > 0) {
				return res
					.status(HTTP_STATUS.OK)
					.send(failure("Failed to add the user", validation));
			}
			const { name, email, phone } = req.body;
			const user = new userModel({
				name: name,
				email: email,
				phone: phone,
			});

			await user
				.save()
				.then((data) => {
					return res
						.status(HTTP_STATUS.OK)
						.send(success("Successfully added the user", data));
				})
				.catch((err) => {
					return res
						.status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
						.send(failure("Failed to add the user"));
				});
		} catch (error) {
			return res
				.status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
				.send(failure("Internal server error"));
		}
	}

	async getAll(req, res) {
		try {
			await userModel
				.find({})
				.then((users) => {
					return res.status(HTTP_STATUS.OK).send(
						success("Successfully received all users", {
							result: users,
							total: users.length,
						})
					);
				})
				.catch((error) => {
					return res
						.status(HTTP_STATUS.OK)
						.send(success("No users were found"));
				});
		} catch (error) {
			console.log(error);
			return res
				.status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
				.send(failure("Internal server error"));
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
