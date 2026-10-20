import { ApiError } from "../utils/ApiError.js";

/** validate(zodSchema, "body" | "query" | "params"). Replaces the input with the parsed, trimmed values. */
export const validate =
  (schema, source = "body") =>
  (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const errors = {};
      for (const issue of result.error.issues) {
        const key = issue.path.join(".") || "form";
        if (!errors[key]) errors[key] = issue.message;
      }
      return next(ApiError.badRequest("Please fix the highlighted fields.", errors));
    }
    // Express 5 makes req.query read-only, so only assign for body / params
    if (source === "query") Object.defineProperty(req, "query", { value: result.data, writable: true });
    else req[source] = result.data;
    next();
  };
