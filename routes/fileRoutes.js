const express = require("express");
const fileRoutes = express();
const upload = require("../config/files");
const fileController = require("../controller/fileController");

fileRoutes.post(
	"/upload-file",
	upload.single("file_to_upload"),
	fileController.uploadFile
);
fileRoutes.get("/get/:filepath", fileController.getFile);

module.exports = fileRoutes;
