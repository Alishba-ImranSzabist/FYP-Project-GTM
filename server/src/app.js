import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import { env } from "./config/env.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import authRoutes from "./features/auth/auth.routes.js";
import userRoutes from "./features/users/user.routes.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.get("/api/health", (_req, res) => res.json({ success: true, message: "GTM API is running" }));

// One line per feature. Add new features (jobs, applications …) here.
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
