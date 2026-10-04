import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { createTrackingApp } from "../src/services/trackingService.js";

test("GPS service enforces tokens and preserves real location state", async () => {
  const dataDir = mkdtempSync(path.join(tmpdir(), "logitrack-test-"));
  const operatorKey = "test-key-".repeat(8);
  let time = Date.now();
  const app = express();
  app.use(express.json());
  app.use("/api/tracking", createTrackingApp({ operatorKey, dataDir, now: () => time }));
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  const base = `http://127.0.0.1:${server.address().port}/api/tracking/vehicles`;
  const request = (url = "", key = "", method = "GET", body) => fetch(base + url, {
    method,
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  try {
    assert.equal((await request()).status, 401);
    const registration = await request("", operatorKey, "POST", { plate: "TN-72 LT 2024", label: "Delivery scooter" });
    assert.equal(registration.status, 201);
    const { driverToken, viewerToken, plate } = await registration.json();
    const location = { latitude: 9.17, longitude: 77.87, accuracy: 12, timestamp: time };
    assert.equal((await request(`/${plate}/location`, viewerToken, "POST", location)).status, 401);
    assert.equal((await request(`/${plate}/location`, driverToken, "POST", location)).status, 200);
    const live = await (await request(`/${plate}`, viewerToken)).json();
    assert.equal(live.location.latitude, 9.17);
    assert.equal(live.stale, false);
    time += 31_000;
    assert.equal((await (await request(`/${plate}`, viewerToken)).json()).stale, true);
    assert.equal((await request(`/${plate}/stop`, driverToken, "POST")).status, 204);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    rmSync(dataDir, { recursive: true, force: true });
  }
});
