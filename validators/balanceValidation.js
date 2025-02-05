/*
 * Filename: balanceValidation.js
 * Author: Pallob Poddar
 * Date: September 20, 2023
 * Description: This module is a middleware which authenticates the balance credentials
 */

// Imports necessary modules
const { body, param } = require("express-validator");

// The balanceAdd array validates the required fields given from request body
const balanceValidator = {
    balanceAdd: [
        param("id").optional().isMongoId().withMessage("Enter a valid MongoDB Id"),
        body("balance")
            .exists()
            .withMessage("Enter a balance")
            .bail()
			.isFloat({ min: 10, max: 20000 })
			.withMessage("Balance must between 10 and 20000"),
    ]
}

// Exports the validator
module.exports = balanceValidator;
