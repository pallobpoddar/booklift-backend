const path = require("path");
const { promisify } = require("util");
const ejs = require("ejs");
const ejsRenderFile = promisify(ejs.renderFile);
const transporter = require("../configs/mail");

const sendEmail = async (auth, token, purpose) => {
  const url = path.join(
    process.env.FRONTEND_URL,
    purpose,
    token,
    auth._id.toString()
  );
  const fileName =
    purpose === "email-verification"
      ? "emailVerification.ejs"
      : "passwordReset.ejs";
  const subject =
    purpose === "email-verification"
      ? "Verify your email address"
      : "Reset password";

  const htmlBody = await ejsRenderFile(
    path.join(__dirname, "..", "views", fileName),
    {
      name: auth.user.name,
      url: url,
    }
  );

  const message = await transporter.sendMail({
    from: "Booklift <no-reply@booklift.com>",
    to: auth.email,
    subject: subject,
    html: htmlBody,
  });

  return message;
};

module.exports = { sendEmail };
