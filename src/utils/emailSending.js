const path = require("path");
const { promisify } = require("util");
const ejs = require("ejs");
const ejsRenderFile = promisify(ejs.renderFile);
const transporter = require("../configs/mail");

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

module.exports = { sendEmail };
