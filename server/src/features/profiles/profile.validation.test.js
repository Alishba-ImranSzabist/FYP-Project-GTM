import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { businessProfileSchema, serviceProviderProfileSchema } from "./profile.validation.js";
import { BusinessProfile } from "./businessProfile.model.js";
import { ServiceProviderProfile } from "./serviceProviderProfile.model.js";

const firstMessage = (result) => result.error?.issues?.[0]?.message;

const validBusiness = {
  businessName: "Northstar Growth",
  industry: "E-commerce",
  productDescription: "We sell skincare essentials for sensitive skin.",
  targetMarket: "UK & EU, women 25-40",
  sellsProducts: true,
};

const validProvider = {
  skills: ["Copywriting", "Email sequences"],
  experience: "5 years running outreach for D2C brands.",
  portfolio: ["https://example.com/work", "https://dribbble.com/shots/abc"],
};

describe("businessProfileSchema", () => {
  test("accepts a full valid payload", () => {
    const result = businessProfileSchema.safeParse(validBusiness);
    assert.equal(result.success, true);
  });

  test("accepts a minimal payload with only businessName", () => {
    const result = businessProfileSchema.safeParse({ businessName: "Acme" });
    assert.equal(result.success, true);
  });

  test("trims whitespace on strings", () => {
    const result = businessProfileSchema.safeParse({ businessName: "  Acme  " });
    assert.equal(result.success, true);
    assert.equal(result.data.businessName, "Acme");
  });

  test("requires businessName", () => {
    const result = businessProfileSchema.safeParse({ industry: "Retail" });
    assert.equal(result.success, false);
    assert.match(firstMessage(result), /business name/i);
  });

  test("rejects a businessName shorter than 2 characters", () => {
    const result = businessProfileSchema.safeParse({ businessName: "A" });
    assert.equal(result.success, false);
  });

  test("rejects a businessName longer than 120 characters", () => {
    const result = businessProfileSchema.safeParse({ businessName: "x".repeat(121) });
    assert.equal(result.success, false);
  });

  test("rejects optional text over its length limit", () => {
    const result = businessProfileSchema.safeParse({
      businessName: "Acme",
      targetMarket: "x".repeat(501),
    });
    assert.equal(result.success, false);
    assert.match(firstMessage(result), /too long/i);
  });

  test("rejects a non-boolean sellsProducts", () => {
    const result = businessProfileSchema.safeParse({ businessName: "Acme", sellsProducts: "yes" });
    assert.equal(result.success, false);
  });

  test("rejects unknown fields (strict)", () => {
    const result = businessProfileSchema.safeParse({ businessName: "Acme", hacker: "1" });
    assert.equal(result.success, false);
  });

  test("partial() allows single-field updates (PATCH) but stays strict", () => {
    const one = businessProfileSchema.partial().safeParse({ targetMarket: "UK buyers" });
    assert.equal(one.success, true);
    const unknown = businessProfileSchema.partial().safeParse({ hacker: "1" });
    assert.equal(unknown.success, false);
  });
});

describe("serviceProviderProfileSchema", () => {
  test("accepts a full valid payload", () => {
    const result = serviceProviderProfileSchema.safeParse(validProvider);
    assert.equal(result.success, true);
  });

  test("accepts an empty object (everything is optional)", () => {
    const result = serviceProviderProfileSchema.safeParse({});
    assert.equal(result.success, true);
  });

  test("accepts empty skills / portfolio arrays", () => {
    const result = serviceProviderProfileSchema.safeParse({ skills: [], portfolio: [] });
    assert.equal(result.success, true);
  });

  test("rejects an empty-string skill", () => {
    const result = serviceProviderProfileSchema.safeParse({ skills: ["Copywriting", "   "] });
    assert.equal(result.success, false);
  });

  test("rejects a skill over 50 characters", () => {
    const result = serviceProviderProfileSchema.safeParse({ skills: ["x".repeat(51)] });
    assert.equal(result.success, false);
    assert.match(firstMessage(result), /50 characters/);
  });

  test("rejects more than 30 skills", () => {
    const result = serviceProviderProfileSchema.safeParse({
      skills: Array.from({ length: 31 }, (_, i) => `skill-${i}`),
    });
    assert.equal(result.success, false);
    assert.match(firstMessage(result), /30 skills/);
  });

  test("rejects a non-array skills value", () => {
    const result = serviceProviderProfileSchema.safeParse({ skills: "copywriting" });
    assert.equal(result.success, false);
  });

  test("rejects an invalid portfolio URL", () => {
    const result = serviceProviderProfileSchema.safeParse({ portfolio: ["not-a-url"] });
    assert.equal(result.success, false);
    assert.match(firstMessage(result), /valid URL/i);
  });

  test("rejects non-http(s) URLs such as mailto", () => {
    const result = serviceProviderProfileSchema.safeParse({ portfolio: ["mailto:hi@example.com"] });
    assert.equal(result.success, false);
  });

  test("rejects more than 10 portfolio links", () => {
    const result = serviceProviderProfileSchema.safeParse({
      portfolio: Array.from({ length: 11 }, (_, i) => `https://example.com/${i}`),
    });
    assert.equal(result.success, false);
    assert.match(firstMessage(result), /10 portfolio/);
  });

  test("rejects experience over 500 characters", () => {
    const result = serviceProviderProfileSchema.safeParse({ experience: "x".repeat(501) });
    assert.equal(result.success, false);
  });

  test("rejects unknown fields (strict)", () => {
    const result = serviceProviderProfileSchema.safeParse({ userId: "someone-else" });
    assert.equal(result.success, false);
  });
});

describe("profile models", () => {
  test("BusinessProfile: userId required + unique, businessName required, timestamps on", () => {
    const userId = BusinessProfile.schema.path("userId");
    assert.equal(userId.isRequired, true);
    assert.equal(userId.options.unique, true);
    assert.equal(userId.options.ref, "User");
    assert.equal(BusinessProfile.schema.path("businessName").isRequired, true);
    assert.equal(BusinessProfile.schema.path("sellsProducts").instance, "Boolean");
    assert.ok(BusinessProfile.schema.path("createdAt"));
    assert.ok(BusinessProfile.schema.path("updatedAt"));
  });

  test("ServiceProviderProfile: userId required + unique, arrays default to [], timestamps on", () => {
    const userId = ServiceProviderProfile.schema.path("userId");
    assert.equal(userId.isRequired, true);
    assert.equal(userId.options.unique, true);
    assert.equal(userId.options.ref, "User");
    const doc = new ServiceProviderProfile({});
    assert.deepEqual(doc.skills, []);
    assert.deepEqual(doc.portfolio, []);
    assert.ok(ServiceProviderProfile.schema.path("createdAt"));
    assert.ok(ServiceProviderProfile.schema.path("updatedAt"));
  });
});

