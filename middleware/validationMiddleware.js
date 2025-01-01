const { validationResult } = require("express-validator");
const HTTP_STATUS = require("../constants/statusCodes");
const sendResponse = require("../util/commonResponse");

const handleValidationErrors = (
  req,
  res,
  next
) => {
  const errors = validationResult(req).array();
  if (errors.length > 0) {
    return sendResponse(
      res,
      HTTP_STATUS.BAD_REQUEST,
      "Validation failed",
      errors
    );
  }
  next();
};

module.exports = handleValidationErrors;