const express = require("express");
const productRoutes = express();
const productController = require("../controller/productController");

productRoutes.post("/add", productController.create);
productRoutes.get("/get-all", productController.getAll);

module.exports = productRoutes;
