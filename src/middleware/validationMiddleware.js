const { validationResult } = require("express-validator");
const HTTP_STATUS = require("../constants/statusCodes");
const sendResponse = require("../utils/responseHandler");

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req).array();
  if (errors.length > 0) {
    return sendResponse(res, HTTP_STATUS.BAD_REQUEST, errors[0].msg, errors);
  }
  next();
};

module.exports = handleValidationErrors;
