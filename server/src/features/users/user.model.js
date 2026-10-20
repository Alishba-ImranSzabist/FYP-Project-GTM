import mongoose from "mongoose";
import bcrypt from "bcryptjs";

export const USER_ROLES = Object.freeze({
  BUSINESS: "business",
  SERVICE_PROVIDER: "service_provider",
  ADMIN: "admin",
});

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    companyName: { type: String, trim: true, maxlength: 120 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false }, // hashed, never returned by default
    avatar: { type: String, default: null }, // small image data URL of the profile photo (or null)
    role: { type: String, enum: Object.values(USER_ROLES), required: true },
    isEmailVerified: { type: Boolean, default: false }, // flips true after the OTP check
    // Browsers/systems that already passed the emailed login code — next login from
    // these skips the extra step. Newest first, capped at MAX_TRUSTED_DEVICES.
    trustedDevices: {
      type: [{ _id: false, id: { type: String, required: true }, lastSeenAt: { type: Date, default: Date.now } }],
      default: [],
      select: false,
    },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function comparePassword(plain) {
  return bcrypt.compare(plain, this.password);
};

/** Safe public shape, used in every API response. */
userSchema.methods.toPublic = function toPublic() {
  return {
    id: this._id,
    fullName: this.fullName,
    companyName: this.companyName,
    email: this.email,
    role: this.role,
    avatar: this.avatar ?? null,
    isEmailVerified: this.isEmailVerified ?? false,
    createdAt: this.createdAt,
  };
};

export const User = mongoose.model("User", userSchema);
