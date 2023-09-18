const { validationResult } = require("express-validator");
const { success, failure } = require("../util/common");
const HTTP_STATUS = require("../constants/statusCodes");
const UserModel = require("../model/user");
const ProductModel = require("../model/book");
const ReviewModel = require("../model/review");

class ReviewController {
	async addReview(req, res) {
		try {
			const validation = validationResult(req).array();
			if (validation.length > 0) {
				return res
					.status(HTTP_STATUS.OK)
					.send(failure("Failed to add a review", validation));
			}

			const { userId, productId, rating, review } = req.body;

			const user = await UserModel.findById({ _id: userId });
			if (!user) {
				return res
					.status(HTTP_STATUS.OK)
					.send(failure("You are not registered"));
			}

			const product = await ProductModel.findById({ _id: productId });
			if (!product) {
				return res
					.status(HTTP_STATUS.OK)
					.send(failure("There's no such product"));
			}

			const reviewObject = new ReviewModel({
				user: userId,
				product: productId,
				rating: rating,
				review: review,
			});

			await reviewObject
				.save()
				.then((data) => {
					return res
						.status(HTTP_STATUS.OK)
						.send(success("Successfully added a review", data));
				})
				.catch((error) => {
					return res
						.status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
						.send(failure("Failed to add a review"));
				});
		} catch (error) {
			return res
				.status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
				.send(failure("Internal server error"));
		}
	}

	async getReview(req, res) {
		try {
			let {
				user,
				product,
				rating,
				ratingFill,
				page,
				limit,
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
			if (user) {
				filter.user = user;
			}
			if (product) {
				filter.product = product;
			}
			if (rating) {
				if (ratingFill === "low") {
					filter.rating = { $lte: parseInt(rating) };
				} else if (ratingFill === "high") {
					filter.rating = { $gte: parseInt(rating) };
				}
			}
			if (search) {
				filter = { review: { $regex: search, $options: "i" } };
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

			let reviews;
			reviews = await ReviewModel.find(filter)
				.sort({
					[sortParam]: sortOrder === "asc" ? 1 : -1,
				})
				.skip((page - 1) * limit)
				.limit(limit);
			if (reviews.length === 0) {
				return res
					.status(HTTP_STATUS.NOT_FOUND)
					.send(failure("No reviews were found"));
			}

			return res.status(HTTP_STATUS.OK).send(
				success("Successfully got all reviews", {
					countPerPage: reviews.length,
					page: parseInt(page),
					limit: parseInt(limit),
					reviews: reviews,
				})
			);
		} catch (error) {
			console.log(error);
			return res
				.status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
				.send(failure("Internal server error"));
		}
	}
}

module.exports = new ReviewController();