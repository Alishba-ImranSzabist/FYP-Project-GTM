import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { createCampaignSchema, updateCampaignSchema, listQuerySchema, idParamsSchema } from "./campaign.validation.js";
import { Campaign } from "./campaign.model.js";

const firstMessage = (result) => result.error?.issues?.[0]?.message;
const errorFields = (result) => result.error.issues.map((issue) => issue.path[0]);

const full = {
  name: "Summer Collection Launch",
  status: "active",
  objective: "generate_leads",
  productName: "Summer Collection",
  targetLocations: ["Lahore", "Karachi"],
  audienceType: "b2c",
  keywords: ["summer lawn"],
  budget: 150000,
  budgetAiSuggested: false,
  startDate: "2026-11-10",
  endDate: "2026-12-10",
  channels: ["email", "instagram"],
};

describe("createCampaignSchema", () => {
  test("accepts a full payload", () => {
    assert.equal(createCampaignSchema.safeParse(full).success, true);
  });

  test("a draft only needs a name and a status", () => {
    assert.equal(createCampaignSchema.safeParse({ name: "Draft one", status: "draft" }).success, true);
  });

  test("rejects a missing name or status", () => {
    assert.equal(createCampaignSchema.safeParse({ status: "draft", objective: "drive_sales" }).success, false);
    assert.equal(createCampaignSchema.safeParse({ name: "Draft one" }).success, false);
  });

  test("rejects unknown fields such as userId or status=completed", () => {
    assert.equal(createCampaignSchema.safeParse({ name: "Ab", status: "draft", userId: "x" }).success, false);
    assert.equal(createCampaignSchema.safeParse({ name: "Ab", status: "completed" }).success, false);
  });

  test("rejects bad enum, budget and date values", () => {
    const draft = { name: "Ab", status: "draft" };
    assert.equal(createCampaignSchema.safeParse({ ...draft, objective: "world_domination" }).success, false);
    assert.equal(createCampaignSchema.safeParse({ ...draft, budget: -5 }).success, false);
    assert.equal(createCampaignSchema.safeParse({ ...draft, startDate: "10/11/2026" }).success, false);
  });

  test("allows clearing budget and dates with null", () => {
    const result = createCampaignSchema.safeParse({
      name: "Ab",
      status: "draft",
      budget: null,
      startDate: null,
      endDate: null,
    });
    assert.equal(result.success, true);
  });
});

describe("launch rules (status = active)", () => {
  test("an active campaign with only a name lists every missing field", () => {
    const result = createCampaignSchema.safeParse({ name: "Ab", status: "active" });
    assert.equal(result.success, false);
    assert.deepEqual(errorFields(result).sort(), [
      "audienceType",
      "channels",
      "endDate",
      "keywords",
      "objective",
      "productName",
      "startDate",
      "targetLocations",
    ]);
  });

  test("empty lists and null dates count as missing", () => {
    const result = createCampaignSchema.safeParse({
      ...full,
      keywords: [],
      channels: [],
      startDate: null,
      endDate: null,
    });
    assert.deepEqual(errorFields(result).sort(), ["channels", "endDate", "keywords", "startDate"]);
  });

  test("the same incomplete payload is fine as a draft", () => {
    assert.equal(createCampaignSchema.safeParse({ name: "Ab", status: "draft" }).success, true);
  });

  test("end date cannot be before start date (draft or active)", () => {
    const backwards = { startDate: "2026-12-10", endDate: "2026-11-10" };
    const draft = createCampaignSchema.safeParse({ name: "Ab", status: "draft", ...backwards });
    const active = createCampaignSchema.safeParse({ ...full, ...backwards });
    assert.equal(draft.success, false);
    assert.equal(active.success, false);
    assert.equal(firstMessage(draft), "End date must be on or after the start date.");
  });

  test("same-day campaigns are allowed", () => {
    const result = createCampaignSchema.safeParse({ ...full, startDate: "2026-11-10", endDate: "2026-11-10" });
    assert.equal(result.success, true);
  });
});

describe("updateCampaignSchema", () => {
  test("takes the same full payload as create", () => {
    assert.equal(updateCampaignSchema.safeParse(full).success, true);
  });

  test("no longer accepts a bare partial payload", () => {
    assert.equal(updateCampaignSchema.safeParse({ keywords: ["a", "b"] }).success, false);
  });

  test("still rejects unknown fields", () => {
    assert.equal(updateCampaignSchema.safeParse({ name: "Ab", status: "draft", hacker: true }).success, false);
  });

  test("trims text", () => {
    const result = updateCampaignSchema.safeParse({ name: "  Eid Teaser  ", status: "draft" });
    assert.equal(result.data.name, "Eid Teaser");
  });
});

describe("listQuerySchema / idParamsSchema", () => {
  test("applies defaults", () => {
    const result = listQuerySchema.safeParse({});
    assert.deepEqual(result.data, { page: 1, limit: 20 });
  });

  test("rejects an unknown status", () => {
    assert.equal(listQuerySchema.safeParse({ status: "paused" }).success, false);
  });

  test("checks the id format", () => {
    assert.equal(idParamsSchema.safeParse({ id: "64b7f0c2a1b2c3d4e5f60718" }).success, true);
    assert.equal(firstMessage(idParamsSchema.safeParse({ id: "nope" })), "Invalid campaign id.");
  });
});

describe("Campaign model", () => {
  test("defaults: draft status, empty lists, PKR", () => {
    const c = new Campaign({ userId: "64b7f0c2a1b2c3d4e5f60718", name: "Test" });
    assert.equal(c.validateSync(), undefined);
    assert.equal(c.status, "draft");
    assert.deepEqual(c.targetLocations.toObject(), []);
    assert.equal(c.currency, "PKR");
    assert.equal(c.budget, null);
  });

  test("toJSON exposes id instead of _id", () => {
    const json = new Campaign({ userId: "64b7f0c2a1b2c3d4e5f60718", name: "Test" }).toJSON();
    assert.ok(json.id);
    assert.equal(json._id, undefined);
  });
});