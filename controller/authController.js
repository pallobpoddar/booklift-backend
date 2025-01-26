const sendResponse = require("../utils/commonResponse");
const HTTP_STATUS = require("../constants/statusCodes");
const userModel = require("../model/user");
const authModel = require("../model/auth");
const bcrypt = require("bcrypt");
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
  async signUp(req, res) {
    try {
      const { name, email, password } = req.body;

      const existingAuth = await authModel.findOne({ email: email });
      if (existingAuth) {
        return sendResponse(
          res,
          HTTP_STATUS.CONFLICT,
          "Email is already registered"
        );
      }

      const session = await mongoose.startSession();
      session.startTransaction();
      let auth, user;

      try {
        user = await userModel.create(
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

      auth[0].user = user[0];
      const verificationToken = crypto.randomBytes(32).toString("hex");

      const message = await sendEmail(
        auth[0],
        verificationToken,
        "email-verification"
      );
      if (!message.messageId) {
        return sendResponse(
          res,
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
          "Failed to send verification email"
        );
      }

      const verificationTokenValidityPeriod = 60 * 60 * 1000;

      await authModel.findByIdAndUpdate(auth[0]._id, {
        $set: {
          verificationToken: verificationToken,
          verificationTokenExpiryDate:
            Date.now() + verificationTokenValidityPeriod,
        },
      });

      return sendResponse(
        res,
        HTTP_STATUS.CREATED,
        "An email has been sent to verify your email address"
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

  async signIn(req, res) {
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
        auth.numberOfFailedSignin += 1;

        if (auth.numberOfFailedSignin < 5) {
          await authModel.findByIdAndUpdate(auth._id, {
            $inc: {
              numberOfFailedSignin: 1,
            },
          });

          return sendResponse(
            res,
            HTTP_STATUS.UNAUTHORIZED,
            "Incorrect email or password"
          );
        }

        const signinBlockedDuration = 60 * 60 * 1000;

        await authModel.findByIdAndUpdate(auth._id, {
          $set: {
            signinBlockedUntil: Date.now() + signinBlockedDuration,
          },
          $inc: {
            numberOfFailedSignin: 1,
          },
        });

        return sendResponse(
          res,
          HTTP_STATUS.TOO_MANY_REQUESTS,
          "Too many requests. Please try again later"
        );
      }

      if (auth.signinBlockedUntil && auth.signinBlockedUntil > Date.now()) {
        return sendResponse(
          res,
          HTTP_STATUS.TOO_MANY_REQUESTS,
          "Too many requests. Please try again later"
        );
      }

      if (!auth.isVerified) {
        return sendResponse(
          res,
          HTTP_STATUS.UNAUTHORIZED,
          "Please verify your email"
        );
      }

      if (auth.numberOfFailedSignin > 0) {
        await authModel.findByIdAndUpdate(auth._id, {
          $set: {
            numberOfFailedSignin: 0,
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

  async signOut(req, res) {
    try {
      const accessToken = req.cookies.accessToken;
      const refreshToken = req.cookies.refreshToken;

      if (!accessToken || !refreshToken) {
        return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, "Unauthorized");
      }

      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");

      return sendResponse(res, HTTP_STATUS.OK, "Successfully signed out");
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
      if (!auth || auth.verificationToken !== token) {
        return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, "Unauthorized");
      }

      if (auth.isVerified) {
        return sendResponse(res, HTTP_STATUS.OK, "Email is already verified");
      }

      if (auth.verificationTokenExpiryDate < Date.now()) {
        return sendResponse(
          res,
          HTTP_STATUS.GONE,
          "Token is expired. Please try again"
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
        "Successfully verified the email",
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
        return sendResponse(res, HTTP_STATUS.OK, "Email is already verified");
      }

      if (auth.verificationTokenExpiryDate > Date.now()) {
        return sendResponse(
          res,
          HTTP_STATUS.CONFLICT,
          "An email has already been sent to verify your email address"
        );
      }

      const verificationToken = crypto.randomBytes(32).toString("hex");

      const message = await sendEmail(
        auth,
        verificationToken,
        "email-verification"
      );
      if (!message.messageId) {
        return sendResponse(
          res,
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
          "Failed to send verification email"
        );
      }

      const verificationTokenValidityPeriod = 60 * 60 * 1000;

      await authModel.findByIdAndUpdate(auth._id, {
        $set: {
          verificationToken: verificationToken,
          verificationTokenExpiryDate:
            Date.now() + verificationTokenValidityPeriod,
        },
      });

      return sendResponse(
        res,
        HTTP_STATUS.OK,
        "An email has been sent to verify your email address"
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

  async sendPasswordResetEmail(req, res) {
    try {
      const { email } = req.body;

      const auth = await authModel.findOne({ email: email }).populate("user");
      if (!auth) {
        return sendResponse(
          res,
          HTTP_STATUS.UNAUTHORIZED,
          "Email is not registered"
        );
      }

      if (auth.passwordResetBlockedUntil > Date.now()) {
        return sendResponse(
          res,
          HTTP_STATUS.TOO_MANY_REQUESTS,
          "Too many requests. Please try again later"
        );
      }

      auth.numberOfPasswordResetEmailSent += 1;

      if (
        auth.numberOfPasswordResetEmailSent >= 5 &&
        auth.numberOfPasswordResetEmailSent % 5 === 0
      ) {
        const passwordResetBlockedDuration = 60 * 60 * 1000;

        await authModel.findByIdAndUpdate(auth._id, {
          $set: {
            passwordResetBlockedUntil:
              Date.now() + passwordResetBlockedDuration,
          },
          $inc: {
            numberOfPasswordResetEmailSent: 1,
          },
        });

        return sendResponse(
          res,
          HTTP_STATUS.TOO_MANY_REQUESTS,
          "Too many requests. Please try again later"
        );
      }

      const passwordResetToken = crypto.randomBytes(32).toString("hex");

      const message = await sendEmail(
        auth,
        passwordResetToken,
        "password-reset",
      );

      if (!message.messageId) {
        return sendResponse(
          res,
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
          "Failed to send password reset email"
        );
      }

      const passwordResetTokenValidityPeriod = 60 * 60 * 1000;

      await authModel.findByIdAndUpdate(auth._id, {
        $set: {
          passwordResetToken: passwordResetToken,
          passwordResetTokenExpiryDate:
            Date.now() + passwordResetTokenValidityPeriod,
        },
        $inc: {
          numberOfPasswordResetEmailSent: 1,
        },
      });

      return sendResponse(
        res,
        HTTP_STATUS.OK,
        "An email has been sent to reset your password"
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
      const { token, id } = req.params;
      const { newPassword } = req.body;

      const auth = await authModel.findById(id);
      if (!auth || auth.passwordResetToken !== token) {
        return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, "Unauthorized");
      }

      if (auth.passwordResetTokenExpiryDate < Date.now()) {
        return sendResponse(
          res,
          HTTP_STATUS.GONE,
          "Token is expired. Please try again"
        );
      }

      if (await bcrypt.compare(newPassword, auth.password)) {
        return sendResponse(
          res,
          HTTP_STATUS.CONFLICT,
          "New password must be different from the previous password"
        );
      }

      const hashedPassword = await hashPassword(newPassword);

      await authModel.findByIdAndUpdate(auth._id, {
        $set: {
          password: hashedPassword,
          passwordResetToken: null,
          passwordResetTokenExpiryDate: null,
          passwordResetBlockedUntil: null,
        },
      });

      return sendResponse(
        res,
        HTTP_STATUS.OK,
        "Successfully reset the password"
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

module.exports = new AuthController();
