import mongoose from "mongoose";

/**
 * One service-provider profile per account (1:1 with User, keyed by the unique userId).
 * skills / portfolio are arrays of plain strings (chips + links added in the form).
 */
const serviceProviderProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    skills: { type: [String], default: [] },
    experience: { type: String, trim: true, maxlength: 500 },
    portfolio: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const ServiceProviderProfile = mongoose.model(
  "ServiceProviderProfile",
  serviceProviderProfileSchema
);
