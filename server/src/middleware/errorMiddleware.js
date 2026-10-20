import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

export const notFound = (req, _res, next) =>
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, _req, res, _next) => {
  let status = err.statusCode || 500;
  let message = err.message || "Something went wrong.";
  let errors = err.errors;

  if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyPattern || {})[0] || "field";
    message = `This ${field} is already in use.`;
    errors = { [field]: message };
  } else if (err.name === "ValidationError" && err.errors) {
    status = 400;
    message = "Please fix the highlighted fields.";
    errors = Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, v.message]));
  } else if (err.type === "entity.parse.failed") {
    status = 400;
    message = "Invalid JSON in request body.";
  }

  if (status >= 500) {
    console.error(err);
    if (env.isProd) message = "Something went wrong on our side. Please try again.";
  }

  res.status(status).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
    ...(!env.isProd && status >= 500 ? { stack: err.stack } : {}),
  });
};
