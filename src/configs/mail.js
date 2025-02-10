const nodemailer = require("nodemailer");
const config = require("./config");

const transporter = nodemailer.createTransport({
	host: config.emailHost,
	port: config.emailPort,
	auth: {
		user: config.emailUser,
		pass: config.emailPass,
	},
});

module.exports = transporter;
