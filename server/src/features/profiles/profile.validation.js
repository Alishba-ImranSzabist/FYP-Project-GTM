import { z } from "zod";
import { USER_ROLES } from "../users/user.model.js";
import { validate } from "../../middleware/validate.js";

/** Shared limits — kept in sync with the client (Features/Panel/roleProfile.js). */
const LIMITS = Object.freeze({
  businessName: 120,
  industry: 120,
  productDescription: 2000,
  targetMarket: 500,
  experience: 500,
  skill: 50,
  skills: 30,
  portfolioLink: 500,
  portfolio: 10,
});

const optionalText = (max, label) =>
  z.string().trim().max(max, `${label} is too long — max ${max} characters.`).optional();

const urlText = z
  .string()
  .trim()
  .max(LIMITS.portfolioLink, "This link is too long — max 500 characters.")
  .url("Enter a valid URL, e.g. https://yoursite.com.")
  .refine((v) => /^https?:\/\//i.test(v), "Portfolio links must start with http:// or https://.");

export const businessProfileSchema = z
  .object({
    businessName: z
      .string({ error: "Enter your business name." })
      .trim()
      .min(2, "Enter your business name.")
      .max(LIMITS.businessName, "Business name is too long — max 120 characters."),
    industry: optionalText(LIMITS.industry, "Industry"),
    productDescription: optionalText(LIMITS.productDescription, "Product description"),
    targetMarket: optionalText(LIMITS.targetMarket, "Target market"),
    sellsProducts: z.boolean().optional(),
  })
  .strict();

export const serviceProviderProfileSchema = z
  .object({
    skills: z
      .array(
        z
          .string()
          .trim()
          .min(1, "Skills cannot be empty.")
          .max(LIMITS.skill, `A skill cannot exceed ${LIMITS.skill} characters.`)
      )
      .max(LIMITS.skills, `You can add up to ${LIMITS.skills} skills.`)
      .optional(),
    experience: optionalText(LIMITS.experience, "Experience"),
    portfolio: z
      .array(urlText)
      .max(LIMITS.portfolio, `You can add up to ${LIMITS.portfolio} portfolio links.`)
      .optional(),
  })
  .strict();

/** Body validation for POST/PATCH /api/profiles/me — schema picked from the logged-in role.
 *  POST = full save (businessName required); PATCH = partial update (all fields optional,
 *  but unknown fields are still rejected). */
export const validateRoleProfile = (source = "body") => (req, res, next) => {
  const full =
    req.user?.role === USER_ROLES.SERVICE_PROVIDER
      ? serviceProviderProfileSchema
      : businessProfileSchema;
  const schema = req.method === "PATCH" ? full.partial() : full;
  return validate(schema, source)(req, res, next);
};
