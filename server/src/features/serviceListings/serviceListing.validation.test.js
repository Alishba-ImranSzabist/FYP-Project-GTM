import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  createServiceSchema, updateServiceSchema, idParamsSchema,
  listQuerySchema, statusBodySchema, invalidRateMessage, isValidPortfolioUrl,
} from "./serviceListing.validation.js";
import { ServiceListing } from "./serviceListing.model.js";

const fields = (result) => result.error.issues.map((issue) => issue.path[0]);
const full = {
  status: "active", name: "Video editing", category: "video_editing",
  description: "Editing reels for brands and creators.", keywords: ["editing"],
  targetMarket: ["Creators"], portfolioLink: "https://example.com/portfolio",
  rate: "PKR 10,000 per video", locations: ["Karachi"], wizardStep: 2,
};
const parse = (data) => createServiceSchema.safeParse(data);

describe("Service validation", () => {
  test("valid complete service activates", () => assert.equal(parse(full).success, true));
  test("draft accepts empty/unfinished name and empty steps for cross-login recovery", () => {
    assert.equal(parse({ status: "draft" }).success, true);
    assert.equal(parse({ status: "draft", name: "" }).success, true);
    assert.equal(parse({ status: "draft", name: "A", description: "Half", wizardStep: 1 }).success, true);
    assert.equal(parse({ status: "draft", name: "A", portfolioLink: "https://ex", rate: "-50" }).success, true);
  });
  test("active rejects same incomplete payload and shows specific missing fields", () => {
    const result = parse({ status: "active", name: "A" });
    assert.equal(result.success, false);
    assert.deepEqual(fields(result).sort(), ["category", "description", "keywords", "name"]);
  });
  test("other category requires custom category on activation", () => {
    assert.deepEqual(fields(parse({ ...full, category: "other" })), ["customCategory"]);
    assert.equal(parse({ ...full, category: "other", customCategory: "Voiceover" }).success, true);
  });
  test("portfolio URL must be safe HTTP(S) when activating", () => {
    assert.equal(parse({ ...full, portfolioLink: "javascript:alert(1)" }).success, false);
    assert.equal(parse({ ...full, portfolioLink: "https://user:secret@example.com" }).success, false);
    assert.equal(parse({ ...full, portfolioLink: "" }).success, true);
    assert.equal(isValidPortfolioUrl("https://example.org"), true);
  });
  test("negative or zero rate rejected on activation, negotiable allowed", () => {
    for (const rate of ["-100", "PKR -500", "Rs. -10", "PKR 0"]) {
      assert.equal(parse({ ...full, rate }).success, false, rate);
      assert.ok(invalidRateMessage(rate));
    }
    for (const rate of ["Negotiable", "PKR 5,000 per video", "5000-10000"]) {
      assert.equal(parse({ ...full, rate }).success, true, rate);
    }
  });
  test("rejects duplicate, empty, excessive and invalid list entries", () => {
    for (const change of [
      { keywords: ["Reels", "reels"] },
      { targetMarket: ["Influencers", "influencers"] },
      { locations: ["Karachi", "karachi"] },
      { locations: [""] },
      { keywords: Array.from({ length: 21 }, (_, i) => `K${i}`) },
      { locations: "Karachi" },
    ]) assert.equal(parse({ ...full, ...change }).success, false);
    assert.deepEqual(parse({ ...full, locations: [" Karachi "] }).data.locations, ["Karachi"]);
  });
  test("valid enum, limit, wizard step, and unknown fields enforced even for drafts", () => {
    for (const extra of [
      { category: "unknown" }, { experience: "super_expert" }, { availability: "someday" },
      { name: "x".repeat(121) }, { wizardStep: 4 }, { userId: "not allowed" },
    ]) assert.equal(parse({ status: "draft", ...extra }).success, false);
    assert.equal(parse({ status: "draft", category: null }).success, true);
    assert.equal(parse({ status: "draft", experience: "", availability: "" }).success, true);
  });
  test("updates use the same validation", () => {
    assert.equal(updateServiceSchema.safeParse({ status: "draft", name: "" }).success, true);
  });
  test("other routes stay strict", () => {
    assert.equal(statusBodySchema.safeParse({ status: "draft" }).success, false);
    assert.equal(statusBodySchema.safeParse({ status: "paused" }).success, true);
    assert.equal(idParamsSchema.safeParse({ id: "bad" }).success, false);
    assert.deepEqual(listQuerySchema.parse({}), { page: 1, limit: 20 });
  });
});

describe("Service Mongoose model", () => {
  test("draft accepts unnamed partial service and preserves wizardStep", () => {
    const service = new ServiceListing({ userId: "64b7f0c2a1b2c3d4e5f60718", status: "draft", wizardStep: 1 });
    assert.equal(service.validateSync(), undefined);
    assert.equal(service.name, "");
    assert.equal(service.wizardStep, 1);
    assert.deepEqual(service.keywords.toObject(), []);
  });
  test("active requires a proper name at model layer too", () => {
    const service = new ServiceListing({ userId: "64b7f0c2a1b2c3d4e5f60718", status: "active", name: "A" });
    assert.ok(service.validateSync());
  });
  test("JSON returns id and hides _id", () => {
    const json = new ServiceListing({ userId: "64b7f0c2a1b2c3d4e5f60718" }).toJSON();
    assert.ok(json.id);
    assert.equal(json._id, undefined);
  });
});
