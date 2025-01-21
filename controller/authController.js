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
const jwt = require("jsonwebtoken");
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
      const verificationTokenExpiryDate = Date.now() + 60 * 60 * 1000;

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
          verificationTokenExpiryDate: verificationTokenExpiryDate,
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

      const auth = await authModel.findOne({ email: email }).populate("user");
      if (!auth) {
        return sendResponse(
          res,
          HTTP_STATUS.UNAUTHORIZED,
          "Incorrect email or password"
        );
      }

      const checkPassword = await comparePasswords(password, auth.password);
      if (!checkPassword) {
        auth.signInFailed += 1;

        if (auth.numberOfSigninFailed < 5) {
          await authModel.findByIdAndUpdate(auth._id, {
            $inc: {
              numberOfSigninFailed: 1,
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
            signinBlockedUntil: Date.now() + blockedDuration,
          },
          $inc: {
            numberOfSigninFailed: 1,
          },
        });

        return sendResponse(
          res,
          HTTP_STATUS.TOO_MANY_REQUESTS,
          "Too many requests. Please try again later."
        );
      }

      if (auth.signinBlockedUntil && auth.signinBlockedUntil > Date.now()) {
        return sendResponse(
          res,
          HTTP_STATUS.TOO_MANY_REQUESTS,
          "Too many requests. Please try again later."
        );
      }

      if (!auth.isVerified) {
        return sendResponse(
          res,
          HTTP_STATUS.UNAUTHORIZED,
          "Please verify your email"
        );
      }

      if (auth.numberOfSigninFailed > 0) {
        await authModel.findByIdAndUpdate(auth._id, {
          $set: {
            numberOfSigninFailed: 0,
            signinBlockedUntil: null,
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

      const accessToken = generateAccessToken({ sub: auth._id });
      const refreshToken = generateRefreshToken({ sub: auth._id });

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
        "Internal server error"
      );
    }
  }

  async refreshToken(req, res) {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, "Unauthorized");
      }

      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
      if (decoded) {
        const accessToken = generateAccessToken({ sub: decoded.sub });
        res.cookie("accessToken", accessToken, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          maxAge: 15 * 60 * 1000,
        });
        return sendResponse(
          res,
          HTTP_STATUS.OK,
          "Successfully refreshed token"
        );
      }
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
  }

  async verifyEmail(req, res) {
    try {
      const { token, id } = req.params;

      const auth = await authModel.findById(id);
      if (
        !auth ||
        (auth.verificationToken && auth.verificationToken !== token)
      ) {
        return sendResponse(
          res,
          HTTP_STATUS.UNAUTHORIZED,
          "Invalid request. Please try again."
        );
      }

      if (auth.isVerified) {
        return sendResponse(
          res,
          HTTP_STATUS.CONFLICT,
          "Email is already verified. You are being redirected to the home page.",
          { status: 409 }
        );
      }

      if (auth.verificationTokenExpiryDate < Date.now()) {
        return sendResponse(
          res,
          HTTP_STATUS.GONE,
          "Token is expired. Please try again."
        );
      }

      const updatedAuth = await authModel
        .findByIdAndUpdate(
          id,
          {
            $set: {
              isVerified: true,
              verificationToken: null,
              verificationTokenExpiryDate: null,
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

  async resendVerificationEmail(req, res) {
    try {
      const { id } = req.params;

      const auth = await authModel.findById(id).populate("user");
      if (!auth) {
        return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, "Unauthorized");
      }

      if (auth.isVerified) {
        return sendResponse(
          res,
          HTTP_STATUS.CONFLICT,
          "Email is already verified. You are being redirected to the home page.",
          { status: 409 }
        );
      }

      if (auth.numberOfVerificationEmailSent >= 5) {
        await authModel.findByIdAndUpdate(id, {
          $set: {
            verificationEmailBlockedUntil: Date.now() + 60 * 60 * 1000,
          },
        });

        return sendResponse(
          res,
          HTTP_STATUS.TOO_MANY_REQUESTS,
          "You've exceeded the request limit"
        );
      }

      const verificationToken = crypto.randomBytes(32).toString("hex");
      const verificationTokenExpiryDate = Date.now() + 60 * 60 * 1000;

      const verificationUrl = path.join(
        process.env.FRONTEND_URL,
        "email-verification",
        verificationToken,
        id
      );

      const message = await sendEmail(
        auth.user.name,
        auth.email,
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

      await authModel.findByIdAndUpdate(id, {
        $set: {
          verificationToken: verificationToken,
          verificationTokenExpiryDate: verificationTokenExpiryDate,
        },
        $inc: {
          numberOfVerificationEmailSent: 1,
        },
      });

      return sendResponse(
        res,
        HTTP_STATUS.OK,
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

  async sendForgotPasswordEmail(req, res) {
    try {
      const { email } = req.body;

      const auth = await authModel
        .findOne({ email: email })
        .populate("user", "-createdAt -updatedAt -__v")
        .select("-email -createdAt -updatedAt -__v");
      if (!auth) {
        return sendResponse(
          res,
          HTTP_STATUS.UNAUTHORIZED,
          "Email is not registered"
        );
      }

      if (auth.numberOfForgotEmailSent >= 5) {
        return sendResponse(
          res,
          HTTP_STATUS.TOO_MANY_REQUESTS,
          "You've exceeded the request limit. Please try again later."
        );
      }

      const resetToken = crypto.randomBytes(32).toString("hex");

      auth.resetPasswordToken = resetToken;
      auth.resetPasswordExpire = Date.now() + 60 * 60 * 1000;
      auth.resetPassword = true;
      await auth.save();

      const resetURL = path.join(
        process.env.FRONTEND_URL,
        "reset-password",
        resetToken,
        auth._id.toString()
      );

      const htmlBody = await ejsRenderFile(
        path.join(__dirname, "..", "views", "forgotPassword.ejs"),
        {
          name: auth.user.name,
          resetURL: resetURL,
        }
      );

      const result = await transporter.sendMail({
        from: "khonika@system.com",
        to: `${auth.user.name} ${email}`,
        subject: "Forgot password?",
        html: htmlBody,
      });

      if (result.messageId) {
        return sendResponse(
          res,
          HTTP_STATUS.OK,
          "Successfully requested for resetting password"
        );
      }

      return sendResponse(
        res,
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
        "Something went wrong"
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
