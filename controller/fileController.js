const path = require("path");
const fileTypes = require("../constants/fileTypes");
const HTTP_STATUS = require("../constants/statusCodes");
const sendResponse = require("../util/commonResponse");
const fs = require("fs");

class fileController {
	async uploadFile(req, res, next) {
		try {
			if (!fileTypes.includes(req.file_extension)) {
				return sendResponse(
					res,
					HTTP_STATUS.NOT_FOUND,
					"Only .jpg, .png, .jpeg, .txt, .pdf extensions are allowed"
				);
			}

			if (!req.file) {
				return sendResponse(
					res,
					HTTP_STATUS.NOT_FOUND,
					"Failed to upload file"
				);
			}

			if (
				req.file_extension === ".jpg" ||
				req.file_extension === ".jpeg" ||
				req.file_extension === ".png"
			) {
				fs.rename(
					req.file.path,
					path.join(__dirname, "..", "server", "images", req.file.filename),
					(err) => {
						if (err) throw err;
					}
				);
			}

			if (req.file_extension === ".pdf") {
				fs.rename(
					req.file.path,
					path.join(__dirname, "..", "server", "pdf", req.file.filename),
					(err) => {
						if (err) throw err;
					}
				);
			}

			return sendResponse(
				res,
				HTTP_STATUS.OK,
				"Successfully uploaded file",
				req.file
			);
		} catch (error) {
			return sendResponse(
				res,
				HTTP_STATUS.INTERNAL_SERVER_ERROR,
				"Internal server error"
			);
		}
	}

	async getFile(req, res, next) {
		try {
			const { filepath } = req.params;

			const lastDotIndex = filepath.lastIndexOf(".");
			let fileExtension;

			if (lastDotIndex !== -1) {
				fileExtension = filepath.slice(lastDotIndex);
			}

			if (!fileTypes.includes(fileExtension)) {
				return sendResponse(
					res,
					HTTP_STATUS.NOT_FOUND,
					"Only .jpg, .png, .jpeg, .txt, .pdf extensions are allowed"
				);
			}

			let directory;
			if (
				fileExtension === ".jpg" ||
				fileExtension === ".jpeg" ||
				fileExtension === ".png"
			) {
				directory = "images";
			} else if (fileExtension === ".pdf") {
				directory = "pdf";
			} else if (fileExtension === ".txt") {
				directory = "text";
			}

			const exists = fs.existsSync(
				path.join(__dirname, "..", "server", directory, filepath)
			);

			if (!exists) {
				return sendResponse(res, HTTP_STATUS.NOT_FOUND, "File not found");
			}
			return res
				.status(200)
				.sendFile(path.join(__dirname, "..", "server", directory, filepath));
		} catch (error) {
			console.log(error);
			return sendResponse(
				res,
				HTTP_STATUS.INTERNAL_SERVER_ERROR,
				"Internal server error"
			);
		}
	}
}

module.exports = new fileController();
