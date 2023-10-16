const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
	host: "sandbox.smtp.mailtrap.io",
	port: 2525,
	auth: {
		user: "0fa9fbf29fae0f",
		pass: "b0a6743ff99b4f",
	},
});

module.exports = transporter;
