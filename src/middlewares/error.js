import createError from "http-errors";
import status from "http-status";
import { logger } from "../utils/logger.js";

const notFoundHandler = (req, res, next) => {
  next(createError(404));
};

const errorHandler = (err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  logger.error(`Error: ${err.message}`, {
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
  });

  res.status(err.status || 500);
  res.render("error");
};

const apiErrorHandler = (err, req, res, next) => {
  const statusCode = err.status || status.INTERNAL_SERVER_ERROR;
  const message = err.message || "Internal Server Error";

  if (statusCode >= 500) {
    logger.error(`Error: ${err.message}`, {
      detail: {
        stack: err,
        url: req.originalUrl,
        method: req.method,
        body: req.body ? req.body : null,
      },
    });
  }

  res.status(statusCode).json({
    status: "error",
    statusCode,
    message,
  });
};

export { notFoundHandler, errorHandler, apiErrorHandler };
