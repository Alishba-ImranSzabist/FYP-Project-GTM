import mongoose from "mongoose";

/**
 * One business profile per account (1:1 with User, keyed by the unique userId).
 * Created/updated from the role-specific profile setup form — the User document
 * keeps the common account fields (name, email, avatar, companyName …).
 */
const businessProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    businessName: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    industry: { type: String, trim: true, maxlength: 120 },
    productDescription: { type: String, trim: true, maxlength: 2000 },
    targetMarket: { type: String, trim: true, maxlength: 500 },
    sellsProducts: { type: Boolean }, // optional — undefined until the owner answers
  },
  { timestamps: true }
);

export const BusinessProfile = mongoose.model("BusinessProfile", businessProfileSchema);
