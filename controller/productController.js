const { validationResult } = require("express-validator");
const { success, failure } = require("../util/common");
const ProductModel = require("../model/product");
const HTTP_STATUS = require("../constants/statusCodes");

class ProductController {
	async create(req, res) {
		try {
			// const validation = validationResult(req).array();
			// if (validation.length > 0) {
			// 	return res
			// 		.status(HTTP_STATUS.OK)
			// 		.send(failure("Failed to add the product", validation));
			// }
			const { title, price, category } = req.body;
			const product = new ProductModel({
				title: title,
				price: price,
				category: category,
			});

			await product
				.save()
				.then((data) => {
					return res
						.status(HTTP_STATUS.OK)
						.send(success("Successfully added the product", data));
				})
				.catch((err) => {
					console.log(err);
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
			let {
				page,
				limit,
				price,
				priceFill,
				discountPercentage,
				discountPercentageFill,
				rating,
				ratingFill,
				stock,
				stockFill,
				brand,
				category,
				search,
				sortParam,
				sortOrder,
			} = req.query;
			if (page < 1 || limit < 0) {
				return res
					.status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
					.send(
						failure(
							"Page and limit values must be at least 1 and 0 respectively"
						)
					);
			}

			let filter = {};
			if (price) {
				if (priceFill === "low") {
					filter.price = { $lte: parseFloat(price) };
				} else if (priceFill === "high") {
					filter.price = { $gte: parseFloat(price) };
				}
			}
			if (discountPercentage) {
				if (discountPercentageFill === "low") {
					filter.discountPercentage = { $lte: parseFloat(discountPercentage) };
				} else if (discountPercentageFill === "high") {
					filter.discountPercentage = { $gte: parseFloat(discountPercentage) };
				}
			}
			if (rating) {
				if (ratingFill === "low") {
					filter.rating = { $lte: parseFloat(rating) };
				} else if (ratingFill === "high") {
					filter.rating = { $gte: parseFloat(rating) };
				}
			}
			if (stock) {
				if (stockFill === "low") {
					filter.stock = { $lte: parseFloat(stock) };
				} else if (stockFill === "high") {
					filter.stock = { $gte: parseFloat(stock) };
				}
			}
			if (brand) {
				filter.brand = { $regex: brand, $options: "i" };
			}
			if (category) {
				filter.category = category.toLowerCase();
			}
			if (search) {
				filter["$or"] = [
					{ title: { $regex: search, $options: "i" } },
					{ description: { $regex: search, $options: "i" } },
				];
			}
			if (!limit) {
				limit = 20;
			}
			if (limit > 50) {
				limit = 50;
			}
			if (!page) {
				page = 1;
			}

			let products;
			products = await ProductModel.find(filter)
				.sort({
					[sortParam]: sortOrder === "asc" ? 1 : -1,
				})
				.skip((page - 1) * limit)
				.limit(limit);

			if (products.length === 0) {
				return res
					.status(HTTP_STATUS.NOT_FOUND)
					.send(failure("No products were found"));
			}

			return res.status(HTTP_STATUS.OK).send(
				success("Successfully got all products", {
					countPerPage: products.length,
					page: parseInt(page),
					limit: parseInt(limit),
					products: products,
				})
			);
		} catch (error) {
			console.log(error);
			return res
				.status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
				.send(failure("Internal server error"));
		}
	}

	// async getOneByID(req, res) {
	// 	try {
	// 		const { id } = req.params;
	// 		await UserModel.findById({ _id: id })
	// 			.then((object) => {
	// 				return res
	// 					.status(HTTP_STATUS.OK)
	// 					.send(success("Successfully received the user", user));
	// 			})
	// 			.catch((error) => {
	// 				return res
	// 					.status(HTTP_STATUS.OK)
	// 					.send(failure("Failed to receive the user"));
	// 			});
	// 	} catch (error) {
	// 		console.log(error);
	// 		return res
	// 			.status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
	// 			.send(failure("Internal server error"));
	// 	}
	// }

	// async updateOneByID(req, res) {
	// 	try {
	// 		const { id } = req.params;
	// 		const updatedData = req.body;
	// 		await UserModel.findByIdAndUpdate(id, updatedData, {
	// 			new: true,
	// 		})
	// 			.then((object) => {
	// 				return res
	// 					.status(HTTP_STATUS.OK)
	// 					.send(success("Successfully updated the user"));
	// 			})
	// 			.catch((error) => {
	// 				return res
	// 					.status(HTTP_STATUS.OK)
	// 					.send(success("Failed to receive the user"));
	// 			});
	// 	} catch (error) {
	// 		return res
	// 			.status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
	// 			.send(failure("Internal server error"));
	// 	}
	// }

	// async deleteOneByID(req, res) {
	// 	try {
	// 		const { id } = req.params;
	// 		await UserModel.findByIdAndDelete({ _id: id }, { new: true })
	// 			.then((object) => {
	// 				return res
	// 					.status(HTTP_STATUS.OK)
	// 					.send(success("Successfully deleted the user"));
	// 			})
	// 			.catch((error) => {
	// 				return res
	// 					.status(HTTP_STATUS.OK)
	// 					.send(success("Failed to receive the user"));
	// 			});
	// 	} catch (error) {
	// 		return res.status(500).send(failure("Internal server error"));
	// 	}
	// }

	// async filterItems(req, res) {
	// 	try {
	// 		const queryParams = getQueryParams(req);
	// 		for (const key in queryParams) {
	// 			if (queryParams.hasOwnProperty(key)) {
	// 				const newJsonObj = { [key]: queryParams[key] };
	// 				console.log(newJsonObj);
	// 			}
	// 		}

	// 		const filteredItems = await productModel.filterItems(queryParams);
	// 		if (filteredItems)
	// 			return res
	// 				.status(200)
	// 				.send(success("Successfully got the products", filteredItems));
	// 		else return res.status(404).send(failure("Data not found", "404"));
	// 	} catch (error) {
	// 		return res.status(500).send(failure("Internal server error"));
	// 	}
	// }
}

module.exports = new ProductController();
