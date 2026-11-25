import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import authRoutes from "./features/auth/auth.routes.js";
import userRoutes from "./features/users/user.routes.js";
import campaignRoutes from "./features/campaigns/campaign.routes.js";
import serviceListingRoutes from "./features/serviceListings/serviceListing.routes.js";
import profileRoutes from "./features/profiles/profile.routes.js";
import aiRecommendationRoutes from "./features/aiRecommendations/routes/recommendation.routes.js";
import aiRecommendationAdminRoutes from "./features/aiRecommendations/routes/admin.routes.js";
import { refreshCampaignExampleFile } from "./features/aiRecommendations/services/examples/campaignExampleFile.service.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.get("/api/health", (_req, res) => res.json({ success: true, message: "GTM API is running" }));

app.get("/api/cron/campaign-examples", async (req, res) => {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.get("authorization") !== `Bearer ${secret}`) {
    return res.sendStatus(401);
  }

  await connectDB();
  const result = await refreshCampaignExampleFile();
  console.info("[Campaign examples cron]", result);
  return res.json({ success: true, ...result });
});

if (process.env.VERCEL === "1") {
  app.use("/api", async (_req, _res, next) => {
    await connectDB();
    next();
  });
}

// Admin routes are mounted before business-user routes at the shared prefix.
app.use("/api/ai-recommendations/admin", aiRecommendationAdminRoutes);
app.use("/api/ai-recommendations", aiRecommendationRoutes);

// Existing feature mounts — unchanged.
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/service-listings", serviceListingRoutes);
app.use("/api/profiles", profileRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
