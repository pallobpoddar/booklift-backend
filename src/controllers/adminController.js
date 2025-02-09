const mongoose = require("mongoose");
const adminModel = require("../models/admin");
const authModel = require("../models/auth");
const sendResponse = require("../utils/responseHandler");
const HTTP_STATUS = require("../constants/statusCodes");
const {
  hashPassword,
  generateStrongPassword,
} = require("../utils/passwordSecurityHandler");
const { sendEmail } = require("../utils/emailSender");

class AdminController {
  async register(req, res) {
    try {
      const { name, email } = req.body;
      const isSuperAdmin = req.auth.admin.isSuperAdmin;

      if (!isSuperAdmin) {
        return sendResponse(res, HTTP_STATUS.FORBIDDEN, "Access denied");
      }

      const existingAuth = await authModel.findOne({ email: email });
      if (existingAuth) {
        return sendResponse(
          res,
          HTTP_STATUS.CONFLICT,
          "Email is already registered"
        );
      }

      const password = await generateStrongPassword();

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const admin = await adminModel.create(
          [
            {
              name: name,
              email: email,
            },
          ],
          { session }
        );

        const hashedPassword = await hashPassword(password);

        await authModel.create(
          [
            {
              email: email,
              password: hashedPassword,
              role: "Admin",
              admin: admin[0]._id,
              isVerified: true,
            },
          ],
          { session }
        );

        await session.commitTransaction();
      } catch (error) {
        console.log(error);
        await session.abortTransaction();
      } finally {
        session.endSession();
      }

      const htmlBodyProperties = { name, email, password };

      const message = await sendEmail(
        "adminRegistration.ejs",
        htmlBodyProperties,
        email,
        "Admin registration"
      );
      if (!message.messageId) {
        return sendResponse(
          res,
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
          "Failed to send verification email"
        );
      }

      return sendResponse(
        res,
        HTTP_STATUS.CREATED,
        "An email with credentials has been sent to the admin"
      );
    } catch (error) {
      console.error(error);
      return sendResponse(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Internal server error"
      );
    }
  }
}

module.exports = new AdminController();
