import mongoose from "mongoose";
import {
  AVAILABILITY_OPTIONS,
  EXPERIENCE_LEVELS,
  SERVICE_CATEGORIES,
  SERVICE_LIMITS as LIMIT,
  SERVICE_STATUS,
} from "./serviceListing.constants.js";

/**
 * One document per service a provider offers (ERD: SERVICE_LISTING).
 * A service provider owns many services (User 1 : N ServiceListing).
 * Fields are grouped by the wizard step that fills them in.
 *
 * Drafts may be incomplete, so only `userId` and `name` are required here.
 * The "ready for AI matching" rules live in serviceListing.validation.js.
 */
const serviceListingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: Object.values(SERVICE_STATUS), default: SERVICE_STATUS.DRAFT },

    // Step 1 — What you offer
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: LIMIT.name },
    category: { type: String, enum: SERVICE_CATEGORIES },
    customCategory: { type: String, trim: true, maxlength: LIMIT.customCategory }, // only used when category = "other"
    description: { type: String, trim: true, maxlength: LIMIT.description },
    keywords: { type: [{ type: String, trim: true, maxlength: LIMIT.keyword }], default: [] },
    // Who the provider wants as clients, e.g. ["Influencers", "Brands", "Startups"] (ERD: target_market)
    targetMarket: { type: [{ type: String, trim: true, maxlength: LIMIT.targetMarket }], default: [] },

    // Step 2 — Details & terms (all optional)
    experience: { type: String, enum: EXPERIENCE_LEVELS },
    portfolioLink: { type: String, trim: true, maxlength: LIMIT.portfolioLink },
    rate: { type: String, trim: true, maxlength: LIMIT.rate },
    availability: { type: String, enum: AVAILABILITY_OPTIONS },
    locations: { type: [{ type: String, trim: true, maxlength: LIMIT.location }], default: [] }, // cities, or "Remote"
    languages: { type: String, trim: true, maxlength: LIMIT.languages },

    // Filled in later by the AI matching feature. The list page only displays these numbers.
    stats: {
      newMatches: { type: Number, default: 0 },
      savedMatches: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true, // createdAt / updatedAt
    toJSON: {
      versionKey: false,
      // API responses use `id` instead of `_id`
      transform: (_doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        return ret;
      },
    },
  }
);

// "My services, newest first".
serviceListingSchema.index({ userId: 1, updatedAt: -1 });

export const ServiceListing = mongoose.model("ServiceListing", serviceListingSchema);
