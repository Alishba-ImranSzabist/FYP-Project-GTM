/** Throw this from services / controllers to send a clean error response. */
export class ApiError extends Error {
  constructor(statusCode, message, errors) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors; // optional { field: "message" }
  }

  static badRequest(msg, errors) { return new ApiError(400, msg, errors); }
  static unauthorized(msg = "Please log in to continue.") { return new ApiError(401, msg); }
  static forbidden(msg = "You do not have permission to do that.") { return new ApiError(403, msg); }
  static notFound(msg = "Not found.") { return new ApiError(404, msg); }
  static conflict(msg, errors) { return new ApiError(409, msg, errors); }
  static tooManyRequests(msg = "Too many attempts. Please try again in a few minutes.") { return new ApiError(429, msg); }
  static internal(msg = "Something went wrong on our side. Please try again.") { return new ApiError(500, msg); }
}
