/** Every successful response has the same shape: { success: true, message?, data } */
export const sendSuccess = (res, data = null, message = "OK", statusCode = 200) =>
  res.status(statusCode).json({ success: true, message, data });

/** Wraps async route handlers so thrown errors reach the error middleware. */
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
