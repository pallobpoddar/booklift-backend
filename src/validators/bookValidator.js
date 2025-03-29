const { body } = require("express-validator");
const {
  validateString,
  validateArray,
  validateInt,
} = require("./commonValidator");

const bookValidator = {
  validateBookAddition: [
    validateString("title", "Title", 200),
    validateArray("authors", 1, 10),
    validateString("authors.*.name", "Author name", 100),
    validateString("authors.*.about", "Author about", 1000),
    body("authors").custom((authors) => {
      const names = authors.map((author) => author.name.toLowerCase().trim());
      const uniqueNames = new Set(names);
      if (names.length !== uniqueNames.size) {
        throw new Error("Each author's name must be unique");
      }
      return true;
    }),
    body("price")
      .exists()
      .withMessage("Price is required")
      .bail()
      .isFloat({ min: 0, max: 10000 })
      .withMessage("Price must be between 0 and 10000"),
    body("discount")
      .optional()
      .isObject()
      .withMessage("Discount must have percentage and start date"),
    validateInt("discount.percentage", "Discount percentage", 1, 100),
    body("discount.startDate")
      .exists()
      .withMessage("Discount start date is required")
      .bail()
      .isISO8601()
      .withMessage("Invalid discount start date format")
      .bail()
      .custom((startDate) => {
        if (new Date(startDate) < Date.now()) {
          throw new Error("Discount start date cannot be in the past");
        }
        return true;
      }),
    body("discount.endDate")
      .optional()
      .isISO8601()
      .withMessage("Invalid discount end date format")
      .bail()
      .custom((endDate, { req }) => {
        if (
          req.body.discount?.startDate &&
          new Date(endDate) <= new Date(req.body.discount.startDate)
        ) {
          throw new Error("Discount end date must be after start date");
        }
        return true;
      }),
    validateString("overview", "Overview", 3000),
    validateArray("categories", 1, 10),
    body("categories.*").isMongoId().withMessage("Invalid category id"),
    body("categories").custom((categories) => {
      const uniqueCategories = new Set(categories);
      if (categories.length !== uniqueCategories.size) {
        throw new Error("Each category id must be unique");
      }
      return true;
    }),
    validateInt("stock", "Stock", 0, 10000),
    body("isbn")
      .exists()
      .withMessage("ISBN is required")
      .bail()
      .isISBN()
      .withMessage("Invalid ISBN"),
    validateString("publisher", "Publisher", 100),
    body("publicationDate")
      .exists()
      .withMessage("Publication date is required")
      .bail()
      .isISO8601()
      .withMessage("Invalid publication date format")
      .bail()
      .custom((publicationDate) => {
        if (new Date(publicationDate) > Date.now()) {
          throw new Error("Publication date must be in the past");
        }
        return true;
      }),
    validateString("language", "Language", 50),
    validateInt("pages", "Pages", 1, 10000),
    validateString("dimensions", "Dimensions", 100),
  ],
};

module.exports = bookValidator;
