import { z } from "zod";

export const updateProfileSchema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your full name.").max(80).optional(),
    companyName: z.string().trim().min(2, "Enter your company name.").max(120).optional(),
    // Profile photo: a small image data URL (client resizes to ~400px first), or null to remove it.
    avatar: z
      .string()
      .startsWith("data:image/", "Upload a valid image.")
      .max(600_000, "Image is too large — please use a smaller photo.")
      .nullable()
      .optional(),
  })
  .strict();

export const listUsersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
