const fs = require("fs/promises");
const path = require("path");

const insertInLog = async (operation, id = null) => {
	try {
		let date = new Date();

		if (operation == "add") {
			message = `Manga added at ${date.getDate()}/${
				date.getMonth() + 1
			}/${date.getFullYear()} at ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} `;
		}

		if (operation == "update") {
			message = `Manga updated at ${date.getDate()}/${
				date.getMonth() + 1
			}/${date.getFullYear()} at ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} `;
		}

		if (operation == "delete") {
			message = `Manga deleted at ${date.getDate()}/${
				date.getMonth() + 1
			}/${date.getFullYear()} at ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} `;
		}
		await fs.appendFile(path.join(__dirname, "log.txt"), message + "\n");

		console.log("Log entry added successfully");
	} catch (error) {
		console.error("Error adding log entry:", error);
	}
};

module.exports = { insertInLog };
