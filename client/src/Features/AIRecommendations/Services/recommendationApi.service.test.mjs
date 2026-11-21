import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  ApiError,
  recommendationApiService,
  request,
} from "./recommendationApi.service.js";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

test("generate sends the saved campaign ID and unwraps the success envelope", async () => {
  let capturedUrl;
  let capturedOptions;

  globalThis.fetch = async (url, options) => {
    capturedUrl = url;
    capturedOptions = options;
    return new Response(
      JSON.stringify({
        success: true,
        data: { recommendation: { id: "rec-123", sections: [{ id: "audience" }] } },
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  };

  const result = await recommendationApiService.generate({
    campaign: { id: "507f1f77bcf86cd799439011" },
    model: "fast",
    recommendationStyle: "balanced",
  });

  assert.equal(capturedUrl, "/api/ai-recommendations");
  assert.equal(capturedOptions.method, "POST");
  assert.equal(capturedOptions.credentials, "include");
  assert.deepEqual(JSON.parse(capturedOptions.body), {
    campaignId: "507f1f77bcf86cd799439011",
    model: "fast",
    recommendationStyle: "balanced",
  });
  assert.equal(result.recommendation.id, "rec-123");
});

test("request turns backend errors into ApiError without a ReferenceError", async () => {
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        success: false,
        message: "Gemini is temporarily busy. Please try again.",
      }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );

  await assert.rejects(
    () => request("/ai-recommendations", { method: "POST", body: { campaignId: "x" } }),
    (error) => {
      assert.ok(error instanceof ApiError);
      assert.equal(error.status, 503);
      assert.equal(error.message, "Gemini is temporarily busy. Please try again.");
      return true;
    }
  );
});

test("request handles non-JSON backend responses safely", async () => {
  globalThis.fetch = async () =>
    new Response("<html>Bad gateway</html>", {
      status: 502,
      headers: { "Content-Type": "text/html" },
    });

  await assert.rejects(
    () => request("/ai-recommendations"),
    (error) => {
      assert.ok(error instanceof ApiError);
      assert.equal(error.status, 502);
      assert.match(error.message, /Bad gateway/);
      return true;
    }
  );
});

test("generate rejects a campaign without an ID before making a request", async () => {
  let called = false;
  globalThis.fetch = async () => {
    called = true;
    return new Response("{}", { status: 200 });
  };

  await assert.rejects(
    () => recommendationApiService.generate({ campaign: {}, model: "fast" }),
    /Select a saved campaign first/
  );
  assert.equal(called, false);
});
