/*
 * Filename: commonFunctions.js
 * Author: Pallob Poddar
 * Date: October 14, 2023
 * Description: This is a helper module which minimizes number of lines
 */

/**
 * Delete function to delete unnecessary fields
 * @param {*} document
 * @returns a javascript object
 */
const deleteStatements = (document) => {
	const filteredInfo = document.toObject();
	delete filteredInfo.createdAt;
	delete filteredInfo.updatedAt;
	delete filteredInfo.__v;
	return filteredInfo;
};

// Exports the function
module.exports = { deleteStatements };
