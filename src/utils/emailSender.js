const path = require("path");
const { promisify } = require("util");
const ejs = require("ejs");
const ejsRenderFile = promisify(ejs.renderFile);
const transporter = require("../configs/mail");
const { generateUrlToken, hashToken } = require("./cryptoTokenHandler");
const config = require("../configs/config");

const sendEmail = async (fileName, htmlBodyProperties, email, subject) => {
  const htmlBody = await ejsRenderFile(
    path.join(__dirname, "..", "views", fileName),
    htmlBodyProperties
  );

  const message = await transporter.sendMail({
    from: "Booklift <no-reply@booklift.com>",
    to: email,
    subject: subject,
    html: htmlBody,
  });

  return message;
};

const constructAndSendEmail = async (id, name, email, type) => {
  const token = await generateUrlToken();
  const hashedToken = hashToken(token);

  const url = path.join(config.frontendUrl, id, "email-verification", token);
  const htmlBodyProperties = { name, url };

  const message = await sendEmail(
    type === "email-verification"
      ? "emailVerification.ejs"
      : "passwordReset.ejs",
    htmlBodyProperties,
    email,
    type === "email-verification"
      ? "Verify your email address"
      : "Reset password"
  );

  return { message, hashedToken };
};

module.exports = { sendEmail, constructAndSendEmail };
