const sendResponse = require("../utils/responseSender");
const HTTP_STATUS = require("../constants/statusCodes");
const userModel = require("../models/user");
const authModel = require("../models/auth");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { constructAndSendEmail } = require("../utils/emailSender");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../utils/jwtHandler");
const {
  hashPassword,
  comparePasswords,
} = require("../utils/passwordSecurityHandler");
const config = require("../configs/config");
const { hashToken } = require("../utils/cryptoTokenHandler");

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

      const { message, hashedToken } = await constructAndSendEmail(
        auth[0].id,
        name,
        email,
        "email-verification"
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
          emailVerificationToken: hashedToken,
          emailVerificationTokenExpiryDate:
            Date.now() + config.emailVerificationTokenValidityPeriod,
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

      const auth = await authModel
        .findOne({ email: email })
        .populate("user")
        .populate("admin");
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

        await authModel.findByIdAndUpdate(auth._id, {
          $set: {
            signinBlockedUntil: Date.now() + config.signinBlockedDuration,
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
        authId: auth._id,
        profileId: auth.user?._id || auth.admin?._id,
        name: auth.user?.name || auth.admin?.name,
        email: auth.email,
        role: auth.role,
        phone: auth.user?.phone || auth.admin?.phone,
        address: auth.user?.address || auth.admin?.address,
      };

      const accessToken = await generateAccessToken({ sub: auth._id });
      const refreshToken = await generateRefreshToken({ sub: auth._id });

      const hashedRefreshToken = hashToken(refreshToken);

      await authModel.findByIdAndUpdate(auth._id, {
        $set: {
          refreshToken: hashedRefreshToken,
        },
      });

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: config.accessTokenValidityPeriod,
      });
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: config.refreshTokenValidityPeriod,
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
      const { id } = req.params;

      if (!accessToken || !refreshToken) {
        return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, "Unauthorized");
      }

      await authModel.findByIdAndUpdate(id, {
        $set: {
          refreshToken: null,
        },
      });

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
      const { id } = req.params;

      const accessToken = req.cookies.accessToken;
      const refreshToken = req.cookies.refreshToken;
      if (accessToken || !refreshToken) {
        return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, "Unauthorized");
      }

      const decoded = await verifyRefreshToken(refreshToken);
      if (!decoded) {
        return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, "Unauthorized");
      }

      const auth = await authModel.findById(id);
      if (!auth) {
        return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, "Unauthorized");
      }

      const hashedCookieRefreshToken = hashToken(refreshToken);

      if (auth.refreshToken !== hashedCookieRefreshToken) {
        await authModel.findByIdAndUpdate(id, {
          $set: {
            refreshToken: null,
          },
        });
        res.clearCookie("refreshToken");

        return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, "Unauthorized");
      }

      const newAccessToken = await generateAccessToken({ sub: id });
      const newRefreshToken = await generateRefreshToken({ sub: id });
      const newHashedRefreshToken = hashToken(newRefreshToken);

      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: config.accessTokenValidityPeriod,
      });
      res.cookie("refreshToken", newHashedRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: config.refreshTokenValidityPeriod,
      });

      return sendResponse(res, HTTP_STATUS.OK, "Successfully refreshed token");
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

      const hashedEmailVerificationToken = hashToken(token);

      const auth = await authModel.findById(id);
      if (
        !auth ||
        auth.emailVerificationToken !== hashedEmailVerificationToken
      ) {
        return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, "Unauthorized");
      }

      if (auth.isVerified) {
        return sendResponse(res, HTTP_STATUS.OK, "Email is already verified");
      }

      if (auth.emailVerificationTokenExpiryDate < Date.now()) {
        return sendResponse(
          res,
          HTTP_STATUS.GONE,
          "Token is expired. Please resend verification email"
        );
      }

      const accessToken = await generateAccessToken({ id: auth._id });
      const refreshToken = await generateRefreshToken({ id: auth._id });
      const hashedRefreshToken = hashToken(refreshToken);

      await authModel
        .findByIdAndUpdate(
          id,
          {
            $set: {
              isVerified: true,
              refreshToken: hashedRefreshToken,
              emailVerificationToken: null,
              emailVerificationTokenExpiryDate: null,
            },
          },
          { new: true }
        )
        .populate("user")
        .populate("admin");

      const data = {
        authId: auth._id,
        profileId: auth.user?._id || auth.admin?._id,
        name: auth.user?.name || auth.admin?.name,
        email: auth.email,
        role: auth.role,
        phone: auth.user?.phone || auth.admin?.phone,
        address: auth.user?.address || auth.admin?.address,
      };

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: config.accessTokenValidityPeriod,
      });
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: config.refreshTokenValidityPeriod,
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

      const auth = await authModel
        .findById(id)
        .populate("user")
        .populate("admin");
      if (!auth) {
        return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, "Unauthorized");
      }

      if (auth.isVerified) {
        return sendResponse(res, HTTP_STATUS.OK, "Email is already verified");
      }

      if (auth.emailVerificationTokenExpiryDate > Date.now()) {
        return sendResponse(
          res,
          HTTP_STATUS.CONFLICT,
          "An email has already been sent to verify your email address"
        );
      }

      const { message, hashedToken } = await constructAndSendEmail(
        auth.id,
        auth.user.name,
        auth.email,
        "email-verification"
      );
      if (!message.messageId) {
        return sendResponse(
          res,
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
          "Failed to send verification email"
        );
      }

      await authModel.findByIdAndUpdate(auth._id, {
        $set: {
          emailVerificationToken: hashedToken,
          emailVerificationTokenExpiryDate:
            Date.now() + config.emailVerificationTokenValidityPeriod,
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

      const auth = await authModel
        .findOne({ email: email })
        .populate("user")
        .populate("admin");
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
        await authModel.findByIdAndUpdate(auth._id, {
          $set: {
            passwordResetBlockedUntil:
              Date.now() + config.passwordResetBlockedDuration,
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

      const { message, hashedToken } = await constructAndSendEmail(
        auth.id,
        auth.user?.name || auth.admin?.name,
        auth.email,
        "password-reset"
      );
      if (!message.messageId) {
        return sendResponse(
          res,
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
          "Failed to send password reset email"
        );
      }

      await authModel.findByIdAndUpdate(auth._id, {
        $set: {
          passwordResetToken: hashedToken,
          passwordResetTokenExpiryDate:
            Date.now() + config.passwordResetTokenValidityPeriod,
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

      const hashedPasswordResetToken = hashToken(token);

      const auth = await authModel.findById(id);
      if (!auth || auth.passwordResetToken !== hashedPasswordResetToken) {
        return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, "Unauthorized");
      }

      if (auth.passwordResetTokenExpiryDate < Date.now()) {
        return sendResponse(
          res,
          HTTP_STATUS.GONE,
          "Token is expired. Please try again"
        );
      }

      const checkPassword = await comparePasswords(newPassword, auth.password);
      if (checkPassword) {
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
          numberOfPasswordResetEmailSent: 0,
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

  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const { id } = req.params;

      const auth = await authModel.findById(id);
      if (!auth) {
        return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, "Unauthorized");
      }

      const checkCurrentPassword = await comparePasswords(
        currentPassword,
        auth.password
      );
      if (!checkCurrentPassword) {
        return sendResponse(
          res,
          HTTP_STATUS.UNAUTHORIZED,
          "Incorrect password"
        );
      }

      const checkNewPassword = await comparePasswords(
        newPassword,
        auth.password
      );
      if (checkNewPassword) {
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
        },
      });

      return sendResponse(
        res,
        HTTP_STATUS.OK,
        "Successfully changed the password"
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
