import assert from "node:assert/strict";
import test from "node:test";

import { getDemoUserWithPassword } from "../src/lib/fallback-auth.js";

test("returns the manager demo user for valid credentials", async () => {
  const user = await getDemoUserWithPassword("manager@transitops.local", "TransitOps@123");

  assert.ok(user);
  assert.equal(user?.email, "manager@transitops.local");
  assert.equal(user?.role, "FLEET_MANAGER");
});

test("rejects invalid credentials", async () => {
  const user = await getDemoUserWithPassword("manager@transitops.local", "wrong-password");

  assert.equal(user, null);
});
