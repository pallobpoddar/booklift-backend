const dotenv = require("dotenv");

class Config {
  constructor() {
    dotenv.config();

    this.port = process.env.PORT || 3000;
    this.databaseUri = process.env.DATABASE_URI;
    this.frontendUrl = process.env.FRONTEND_URL;
    this.emailHost = process.env.EMAIL_HOST;
    this.emailPort = process.env.EMAIL_PORT;
    this.emailUser = process.env.EMAIL_USER;
    this.emailPass = process.env.EMAIL_PASS;
    this.accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
    this.refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
    this.emailVerificationTokenValidityPeriod = 60 * 60 * 1000;
    this.signinBlockedDuration = 60 * 60 * 1000;
    this.accessTokenValidityPeriod = 15 * 60 * 1000;
    this.refreshTokenValidityPeriod = 7 * 24 * 60 * 60 * 1000;
    this.passwordResetBlockedDuration = 60 * 60 * 1000;
    this.passwordResetTokenValidityPeriod = 60 * 60 * 1000;
  }
}

module.exports = new Config();
