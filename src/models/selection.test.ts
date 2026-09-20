import assert from "node:assert/strict";
import test from "node:test";
import { isQuotaFallbackStatus, modelSelectionSettings, orderedModelIds } from "./selection";

test("normalizes a preferred model and ordered unique fallbacks", () => {
  assert.deepEqual(modelSelectionSettings({
    preferredModelId: "gpt-5.2",
    fallbackModelIds: ["gpt-5.1", "gpt-5.1", "invalid id"],
  }), { preferredModelId: "gpt-5.2", fallbackModelIds: ["gpt-5.1"] });
});

test("routes Auto to the preferred live model and available fallbacks", () => {
  const settings = modelSelectionSettings({ preferredModelId: "gpt-5.2", fallbackModelIds: ["gpt-5.1", "missing"] });
  assert.deepEqual(orderedModelIds("auto", settings, ["gpt-5.1", "gpt-5.2"]), ["gpt-5.2", "gpt-5.1"]);
  assert.deepEqual(orderedModelIds("gpt-5.1", settings, ["gpt-5.1", "gpt-5.2"]), ["gpt-5.1"]);
});

test("only quota and access-limit responses trigger model fallback", () => {
  assert.equal(isQuotaFallbackStatus(403), true);
  assert.equal(isQuotaFallbackStatus(429), true);
  assert.equal(isQuotaFallbackStatus(500), false);
});
