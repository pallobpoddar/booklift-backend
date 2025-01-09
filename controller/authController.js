const { validationResult } = require("express-validator");
const sendResponse = require("../utils/commonResponse");
const HTTP_STATUS = require("../constants/statusCodes");
const userModel = require("../model/user");
const authModel = require("../model/auth");
const bcrypt = require("bcrypt");
const path = require("path");
const { promisify } = require("util");
const ejs = require("ejs");
const transporter = require("../config/mail");
const ejsRenderFile = promisify(ejs.renderFile);
const crypto = require("crypto");
const { default: mongoose } = require("mongoose");
const { hashPassword, comparePasswords } = require("../utils/passwordHashing");
const { sendEmail } = require("../utils/emailSending");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/tokenGeneration");

class AuthController {
  async signup(req, res) {
    try {
      const { name, email, password } = req.body;

      const isEmailRegistered = await authModel.findOne({ email: email });
      if (isEmailRegistered) {
        return sendResponse(
          res,
          HTTP_STATUS.CONFLICT,
          "Email is already registered"
        );
      }

      const session = await mongoose.startSession();
      session.startTransaction();
      let auth;

      try {
        const user = await userModel.create(
          [
            {
              name: name,
              email: email,
            },
          ],
          { session }
        );

        const hashedPassword = await hashPassword(password);

        auth = await authModel.create(
          [
            {
              email: email,
              password: hashedPassword,
              user: user[0]._id,
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

      const verificationToken = crypto.randomBytes(32).toString("hex");
      const verificationTokenExpire = Date.now() + 60 * 60 * 1000;

      const verificationUrl = path.join(
        process.env.FRONTEND_URL,
        "email-verification",
        verificationToken,
        auth[0]._id.toString()
      );

      const message = await sendEmail(
        name,
        email,
        "Verify your email address",
        verificationUrl,
        "emailVerification.ejs"
      );

      if (!message.messageId) {
        return sendResponse(
          res,
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
          "Failed to send verification email"
        );
      }

      await authModel.findByIdAndUpdate(auth[0]._id, {
        $set: {
          verificationToken: verificationToken,
          verificationTokenExpire: verificationTokenExpire,
          verificationEmailSent: 1,
        },
      });

      return sendResponse(
        res,
        HTTP_STATUS.CREATED,
        "We've sent you an email to verify your email address. Please check your email and complete the verification process."
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

  async signin(req, res) {
    try {
      const { email, password } = req.body;

      const auth = await authModel
        .findOne({ email: email })
        .populate("user", "-createdAt -updatedAt -__v")
        .select("-email -createdAt -updatedAt -__v");
      if (!auth) {
        return sendResponse(
          res,
          HTTP_STATUS.UNAUTHORIZED,
          "Incorrect email or password"
        );
      }

      const checkPassword = await comparePasswords(password, auth.password);
      if (!checkPassword) {
        if (auth.signInFailed < 5) {
          await authModel.findByIdAndUpdate(auth._id, {
            $inc: {
              signInFailed: 1,
            },
          });

          return sendResponse(
            res,
            HTTP_STATUS.UNAUTHORIZED,
            "Incorrect email or password"
          );
        }

        const blockedDuration = 60 * 60 * 1000;

        await authModel.findByIdAndUpdate(auth._id, {
          $set: {
            signInBlockedUntil: new Date(Date.now() + blockedDuration),
          },
          $inc: {
            signInFailed: 1,
          },
        });
      }

      if (
        auth.signInBlockedUntil &&
        auth.signInBlockedUntil > new Date(Date.now())
      ) {
        return sendResponse(
          res,
          HTTP_STATUS.TOO_MANY_REQUESTS,
          "You have exceeded the maximum number of requests per hour"
        );
      }

      if (!auth.isVerified) {
        return sendResponse(
          res,
          HTTP_STATUS.UNAUTHORIZED,
          "Please verify your email"
        );
      }

      if (auth.signInFailed > 0) {
        await authModel.findByIdAndUpdate(auth._id, {
          $set: {
            signInFailed: 0,
            signInBlockedUntil: null,
          },
        });
      }

      const data = {
        id: auth._id,
        name: auth.user.name,
        email: auth.user.email,
        phone: auth.user.phone,
        address: auth.user.address,
        isAdmin: auth.isAdmin,
        isVerified: auth.isVerified,
      };

      const accessToken = generateAccessToken({ id: auth._id });
      const refreshToken = generateRefreshToken({ id: auth._id });

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 15 * 60 * 1000,
      });
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return sendResponse(res, HTTP_STATUS.OK, "Successfully signed in", data);
    } catch (error) {
      console.error(error);
      return sendResponse(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Internal server error",
        "Server error"
      );
    }
  }

  async verifyEmail(req, res) {
    try {
      const { token, id } = req.params;

      const auth = await authModel.findById(id);
      if (!auth || auth.verificationToken !== token) {
        return sendResponse(
          res,
          HTTP_STATUS.UNAUTHORIZED,
          "Invalid request. Please try again."
        );
      }

      if (auth.verificationTokenExpire < Date.now()) {
        return sendResponse(
          res,
          HTTP_STATUS.GONE,
          "Token is expired. Please try again."
        );
      }

      if (auth.isVerified) {
        return sendResponse(
          res,
          HTTP_STATUS.CONFLICT,
          "Email is already verified. Please sign in."
        );
      }

      const updatedAuth = await authModel
        .findByIdAndUpdate(
          id,
          {
            $set: {
              isVerified: true,
              verificationToken: null,
              verificationTokenExpire: null,
              verificationEmailSent: 0,
            },
          },
          { new: true }
        )
        .populate("user");

      const data = {
        id: updatedAuth._id,
        name: updatedAuth.user.name,
        email: updatedAuth.user.email,
        phone: updatedAuth.user.phone,
        address: updatedAuth.user.address,
        isAdmin: updatedAuth.isAdmin,
        isVerified: updatedAuth.isVerified,
      };

      const accessToken = generateAccessToken({ id: updatedAuth._id });
      const refreshToken = generateRefreshToken({ id: updatedAuth._id });

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 15 * 60 * 1000,
      });
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return sendResponse(
        res,
        HTTP_STATUS.OK,
        "Email is successfully verified. You are being redirected to the home page.",
        data
      );
    } catch (error) {
      console.error(error);
      return sendResponse(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Internal server error",
        "Server error"
      );
    }
  }

  async sendForgotPasswordEmail(req, res) {
    try {
      // If the user provides invalid properties, it returns an error
      const allowedProperties = ["email"];
      const unexpectedProps = Object.keys(req.body).filter(
        (key) => !allowedProperties.includes(key)
      );
      if (unexpectedProps.length > 0) {
        return sendResponse(
          res,
          HTTP_STATUS.UNPROCESSABLE_ENTITY,
          "Failed to reset password",
          `Unexpected properties: ${unexpectedProps.join(", ")}`
        );
      }

      // If the user provides invalid information, it returns an error
      const validation = validationResult(req).array();
      if (validation.length > 0) {
        return sendResponse(
          res,
          HTTP_STATUS.UNPROCESSABLE_ENTITY,
          "Failed to reset password",
          validation
        );
      }

      // Destructures necessary elements from request body
      const { email } = req.body;

      // Populates user data from auth model and discards unnecessary fields
      const auth = await authModel
        .findOne({ email: email })
        .populate("user", "-createdAt -updatedAt -__v")
        .select("-email -createdAt -updatedAt -__v");

      // If the user is not registered, it returns an error
      if (!auth) {
        return sendResponse(
          res,
          HTTP_STATUS.UNAUTHORIZED,
          "User is not registered",
          "Unauthorized"
        );
      }

      // Generates a random reset token using crypto
      const resetToken = crypto.randomBytes(32).toString("hex");

      // Saves the token, expired time and a boolean value inside the model
      auth.resetPasswordToken = resetToken;
      auth.resetPasswordExpire = Date.now() + 60 * 60 * 1000;
      auth.resetPassword = true;
      await auth.save();

      // Creates the reset URL
      const resetURL = path.join(
        process.env.FRONTEND_URL,
        "reset-password",
        resetToken,
        auth._id.toString()
      );

      // Creates the html body using ejs
      const htmlBody = await ejsRenderFile(
        path.join(__dirname, "..", "views", "forgotPassword.ejs"),
        {
          name: auth.user.name,
          resetURL: resetURL,
        }
      );

      // Sets the mail attributes
      const result = await transporter.sendMail({
        from: "khonika@system.com",
        to: `${auth.user.name} ${email}`,
        subject: "Forgot password?",
        html: htmlBody,
      });

      // If message id exists, it returns a success response
      if (result.messageId) {
        return sendResponse(
          res,
          HTTP_STATUS.OK,
          "Successfully requested for resetting password"
        );
      }

      // Otherwise, it returns an error
      return sendResponse(
        res,
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
        "Something went wrong"
      );
    } catch (error) {
      console.error(error);
      // Returns an error
      return sendResponse(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Internal server error",
        "Server error"
      );
    }
  }

  async resetPassword(req, res) {
    try {
      const { token, id, newPassword, confirmPassword } = req.body;

      const auth = await authModel.findById({
        _id: id,
      });
      if (!auth) {
        return sendResponse(res, HTTP_STATUS.NOT_FOUND, "Invalid request");
      }

      if (auth.resetPasswordExpire < Date.now()) {
        return sendResponse(res, HTTP_STATUS.GONE, "Expired request");
      }

      if (auth.resetPasswordToken !== token || auth.resetPassword === false) {
        return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, "Invalid token");
      }

      if (newPassword !== confirmPassword) {
        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "Passwords do not match"
        );
      }

      if (await bcrypt.compare(newPassword, auth.password)) {
        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "Password cannot be same as the old password"
        );
      }

      // Hashes the password
      const hashedPassword = await bcrypt.hash(newPassword, 10).then((hash) => {
        return hash;
      });

      const result = await authModel.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(id) },
        {
          password: hashedPassword,
          resetPassword: false,
          resetPasswordExpire: null,
          resetPasswordToken: null,
        }
      );

      if (result.isModified) {
        return sendResponse(
          res,
          HTTP_STATUS.OK,
          "Successfully updated password"
        );
      }
    } catch (error) {
      console.log(error);
      // Returns an error
      return sendResponse(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Internal server error",
        "Server error"
      );
    }
  }

  async validatePasswordResetRequest(req, res) {
    try {
      const { token, id } = req.body;

      const auth = await authModel.findOne({
        _id: new mongoose.Types.ObjectId(id),
      });
      if (!auth) {
        return sendResponse(res, HTTP_STATUS.NOT_FOUND, "Invalid request");
      }

      if (auth.resetPasswordExpire < Date.now()) {
        return sendResponse(res, HTTP_STATUS.GONE, "Expired request");
      }

      if (auth.resetPasswordToken !== token || auth.resetPassword === false) {
        return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, "Invalid token");
      }
      return sendResponse(res, HTTP_STATUS.OK, "Request is still valid");
    } catch (error) {
      console.log(error);
      return sendResponse(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Something went wrong!"
      );
    }
  }
}

module.exports = new AuthController();
