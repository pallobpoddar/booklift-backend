const sendResponse = (res, status, message, result = null) => {
  const response = {};

  if (status >= 400) {
    response.success = false;
    response.message = message || "Internal server error";
    if (result) response.errors = result;
  } else {
    response.success = true;
    response.message = message || "Successfully completed operations";
    response.data = result;
  }

  res.status(status).send(response);
};

module.exports = sendResponse;
