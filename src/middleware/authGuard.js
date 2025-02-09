const jwt = require("jsonwebtoken");
const sendResponse = require("../utils/responseHandler");
const HTTP_STATUS = require("../constants/statusCodes");
const { verifyAccessToken } = require("../utils/jwtTokenHandler");
const authModel = require("../models/auth");

const authGuard = (roles) => {
  return async (req, res, next) => {
    try {
      const accessToken = req.cookies.accessToken;
      if (!accessToken) {
        return sendResponse(
          res,
          HTTP_STATUS.UNAUTHORIZED,
          "Access token required"
        );
      }

      const decoded = verifyAccessToken(accessToken);

      const auth = await authModel
        .findById(decoded.sub)
        .populate("admin")
        .populate("user");
      if (!auth) {
        return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, "Unauthorized");
      }

      if (roles && !roles.includes(auth.role)) {
        return sendResponse(res, HTTP_STATUS.FORBIDDEN, "Access denied");
      }

      req.auth = auth;
      next();
    } catch (error) {
      console.error(error);
      if (error instanceof jwt.TokenExpiredError) {
        return sendResponse(
          res,
          HTTP_STATUS.UNAUTHORIZED,
          "Please sign in again"
        );
      }

      if (error instanceof jwt.JsonWebTokenError) {
        return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, "Unauthorized");
      }

      return sendResponse(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Internal server error"
      );
    }
  };
};

module.exports = authGuard;
