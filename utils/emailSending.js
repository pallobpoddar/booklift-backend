const path = require("path");
const { promisify } = require("util");
const ejs = require("ejs");
const ejsRenderFile = promisify(ejs.renderFile);
const transporter = require("../config/mail");

const sendEmail = async (name, email, subject, url, fileName) => {
  try {
    const htmlBody = await ejsRenderFile(
      path.join(__dirname, "..", "views", fileName),
      {
        name: name,
        url: url,
      }
    );

    const message = await transporter.sendMail({
      from: "Booklift <no-reply@booklift.com>",
      to: email,
      subject: subject,
      html: htmlBody,
    });

    return message;
  } catch (error) {
    console.error(error);
  }
}

module.exports = {sendEmail};