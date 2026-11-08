import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  createServiceSchema,
  idParamsSchema,
  listQuerySchema,
  statusBodySchema,
} from "./serviceListing.validation.js";
import { ServiceListing } from "./serviceListing.model.js";

const errorFields = (result) => result.error.issues.map((issue) => issue.path[0]);

const full = {
  status: "active",
  name: "Video editing for reels and short films",
  category: "video_editing",
  description: "I edit short-form video for creators and small brands.",
  keywords: ["reels editing", "short film"],
  experience: "3_5",
  portfolioLink: "https://example.com/portfolio",
  availability: "part_time",
  languages: "Urdu, English",
};

describe("createServiceSchema", () => {
  test("accepts a full payload", () => {
    assert.equal(createServiceSchema.safeParse(full).success, true);
  });

  test("a draft only needs a name and a status", () => {
    assert.equal(createServiceSchema.safeParse({ name: "Draft", status: "draft" }).success, true);
  });

  test("rejects missing name/status, unknown fields and status=paused", () => {
    assert.equal(createServiceSchema.safeParse({ status: "draft" }).success, false);
    assert.equal(createServiceSchema.safeParse({ name: "Draft" }).success, false);
    assert.equal(createServiceSchema.safeParse({ name: "Ab", status: "draft", userId: "x" }).success, false);
    assert.equal(createServiceSchema.safeParse({ name: "Ab", status: "paused" }).success, false);
  });

  test("an active service with only a name lists every missing field", () => {
    const result = createServiceSchema.safeParse({ name: "Ab", status: "active" });
    assert.deepEqual(errorFields(result).sort(), ["category", "description", "keywords"]);
  });

  test("category 'other' needs a custom category when active", () => {
    const result = createServiceSchema.safeParse({ ...full, category: "other" });
    assert.deepEqual(errorFields(result), ["customCategory"]);
  });

  test("portfolio link must be an http(s) link, empty is fine", () => {
    assert.equal(createServiceSchema.safeParse({ ...full, portfolioLink: "my site" }).success, false);
    assert.equal(createServiceSchema.safeParse({ ...full, portfolioLink: "" }).success, true);
  });

  test("locations is a list: trimmed items, max 10, no empty items, no old single `location` field", () => {
    const ok = createServiceSchema.safeParse({ ...full, locations: ["Karachi", " Remote "] });
    assert.equal(ok.success, true);
    assert.deepEqual(ok.data.locations, ["Karachi", "Remote"]);

    const tooMany = Array.from({ length: 11 }, (_, i) => `City ${i}`);
    assert.equal(createServiceSchema.safeParse({ ...full, locations: tooMany }).success, false);
    assert.equal(createServiceSchema.safeParse({ ...full, locations: [""] }).success, false);
    assert.equal(createServiceSchema.safeParse({ ...full, locations: "Karachi" }).success, false);
    assert.equal(createServiceSchema.safeParse({ ...full, location: "Karachi" }).success, false);
  });

  test("targetMarket is an optional list: trimmed items, max 10, no empty items", () => {
    const ok = createServiceSchema.safeParse({ ...full, targetMarket: ["Influencers", " Brands "] });
    assert.equal(ok.success, true);
    assert.deepEqual(ok.data.targetMarket, ["Influencers", "Brands"]);
    assert.equal(createServiceSchema.safeParse(full).success, true); // still optional when active

    const tooMany = Array.from({ length: 11 }, (_, i) => `Market ${i}`);
    assert.equal(createServiceSchema.safeParse({ ...full, targetMarket: tooMany }).success, false);
    assert.equal(createServiceSchema.safeParse({ ...full, targetMarket: [""] }).success, false);
    assert.equal(createServiceSchema.safeParse({ ...full, targetMarket: "Brands" }).success, false);
  });

  test("empty string clears experience / availability", () => {
    assert.equal(createServiceSchema.safeParse({ ...full, experience: "", availability: "" }).success, true);
    assert.equal(createServiceSchema.safeParse({ ...full, experience: "forever" }).success, false);
  });
});

describe("other schemas", () => {
  test("status body only allows active / paused", () => {
    assert.equal(statusBodySchema.safeParse({ status: "paused" }).success, true);
    assert.equal(statusBodySchema.safeParse({ status: "draft" }).success, false);
  });

  test("list query defaults and id check", () => {
    assert.deepEqual(listQuerySchema.parse({}), { page: 1, limit: 20 });
    assert.equal(idParamsSchema.safeParse({ id: "64b7f0c2a1b2c3d4e5f60718" }).success, true);
    assert.equal(idParamsSchema.safeParse({ id: "nope" }).success, false);
  });
});

describe("ServiceListing model", () => {
  test("defaults: draft, empty keywords, zero match stats", () => {
    const s = new ServiceListing({ userId: "64b7f0c2a1b2c3d4e5f60718", name: "Test" });
    assert.equal(s.validateSync(), undefined);
    assert.equal(s.status, "draft");
    assert.deepEqual(s.keywords.toObject(), []);
    assert.equal(s.stats.newMatches, 0);
  });

  test("toJSON exposes id instead of _id", () => {
    const json = new ServiceListing({ userId: "64b7f0c2a1b2c3d4e5f60718", name: "Test" }).toJSON();
    assert.ok(json.id);
    assert.equal(json._id, undefined);
  });
});
