const { validationResult } = require("express-validator");
const { success, failure } = require("../util/common");
const CartModel = require("../model/cart");
const UserModel = require("../model/user");
const ProductModel = require("../model/book");
const TransactionModel = require("../model/transaction");
const HTTP_STATUS = require("../constants/statusCodes");
const mongoose = require("mongoose");

class CartController {
	async addItems(req, res) {
		try {
			const validation = validationResult(req).array();
			if (validation.length > 0) {
				return res
					.status(HTTP_STATUS.OK)
					.send(failure("Failed to add items", validation));
			}

			const { userId, productId, quantity } = req.body;

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
			const productObject = product.toObject();
			let cartObject = await CartModel.findById({ user: userId });
			if (!cartObject) {
				const cart = new CartModel({
					user: userId,
					products: {
						product: productId,
						quantity: quantity,
					},
					total: productObject.price * quantity,
				});

				await cart
					.save()
					.then((data) => {
						return res
							.status(HTTP_STATUS.OK)
							.send(success("Successfully created a cart", data));
					})
					.catch((error) => {
						return res
							.status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
							.send(failure("Failed to create a cart"));
					});
			} else {
				let removeFlag = false;
				let responseFlag = false;
				cartObject.products.forEach((data) => {
					const productIdToString = String(data.product);
					if (productIdToString === productId) {
						removeFlag = true;
						if (data.quantity + quantity <= productObject.stock) {
							data.quantity = data.quantity + quantity;
						} else {
							responseFlag = true;
						}
					}
				});

				if (responseFlag === true) {
					return res.status(HTTP_STATUS.OK).send(failure("Not enough stock"));
				}

				if (removeFlag === false) {
					const newProduct = {
						product: productId,
						quantity: quantity,
					};
					cartObject.products.push(newProduct);
				}
				cartObject.total = cartObject.total + productObject.price * quantity;
				await cartObject
					.save()
					.then((data) => {
						return res
							.status(HTTP_STATUS.OK)
							.send(success("Added items to the cart", data));
					})
					.catch((error) => {
						return res
							.status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
							.send(failure("Failed to add items to the cart"));
					});
			}
		} catch (error) {
			return res
				.status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
				.send(failure("Internal server error"));
		}
	}

	async removeItems(req, res) {
		try {
			const validation = validationResult(req).array();
			if (validation.length > 0) {
				return res
					.status(HTTP_STATUS.OK)
					.send(failure("Failed to remove items", validation));
			}

			const { userId, productId, quantity } = req.body;

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
			const productObject = product.toObject();
			let cartObject = await CartModel.findById({ user: userId });
			if (!cartObject) {
				return res
					.status(HTTP_STATUS.OK)
					.send(failure("You don't have a cart"));
			} else {
				let removeFlag = false;
				let responseFlag = false;
				cartObject.products.forEach((data) => {
					const productIdToString = String(data.product);
					if (productIdToString === productId) {
						removeFlag = true;
						if (data.quantity - quantity >= 0) {
							data.quantity = data.quantity - quantity;
						} else {
							responseFlag = true;
						}
					}
				});

				if (responseFlag === true) {
					return res
						.status(HTTP_STATUS.OK)
						.send(failure("Number of items should be at least 0"));
				}

				if (removeFlag === false) {
					return res
						.status(HTTP_STATUS.OK)
						.send(failure("You don't have this product in your cart"));
				}

				cartObject.total = cartObject.total - productObject.price * quantity;
				await cartObject
					.save()
					.then((data) => {
						return res
							.status(HTTP_STATUS.OK)
							.send(success("Removed items from the cart", data));
					})
					.catch((error) => {
						return res
							.status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
							.send(failure("Failed to remove items from the cart"));
					});
			}
		} catch (error) {
			return res
				.status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
				.send(failure("Internal server error"));
		}
	}

	async checkout(req, res) {
		try {
			const validation = validationResult(req).array();
			if (validation.length > 0) {
				return res
					.status(HTTP_STATUS.OK)
					.send(failure("Failed to checkout", validation));
			}

			const { cartId } = req.body;
			const cart = await CartModel.findById({ _id: cartId });
			if (!cart) {
				return res.status(HTTP_STATUS.OK).send(failure("There's no such cart"));
			} else {
			}

			const cartObject = cart.toObject();
			const transaction = new TransactionModel({
				cart: cartId,
				user: cartObject.user,
				products: cartObject.products,
				total: cartObject.total,
			});

			await transaction
				.save()
				.then((data) => {
					return res
						.status(HTTP_STATUS.OK)
						.send(success("Successfully created a transaction", data));
				})
				.catch((error) => {
					return res
						.status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
						.send(failure("Failed to create a transaction"));
				});
		} catch (error) {
			return res
				.status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
				.send(failure("Internal server error"));
		}
	}
}

module.exports = new CartController();
