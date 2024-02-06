const errorMiddleware = (err, req, res, next) => {
  let statusCode = res.statusCode == 200 ? 500 : res.statusCode;

  if (err.statusCode) {
    statusCode = err.statusCode;
  }

  err.message = !err.message
    ? '"Something went wrong, try again later"'
    : err.message;

  res.status(statusCode).json({ message: err.message });
};

module.exports = errorMiddleware;
