// D06 — erros de validação do backend em texto amigável.
//   docker compose exec frontend npm test
import { test } from "node:test";
import assert from "node:assert/strict";

import { friendlyValidationMessage as f } from "./validationMessages.js";

test("translates common Pydantic messages", () => {
  assert.equal(
    f({ loc: ["body", "description"], msg: "String should have at most 200 characters" }),
    "Description must be at most 200 characters."
  );
  assert.equal(
    f({ loc: ["body", "name"], msg: "String should have at least 1 character" }),
    "Name cannot be empty."
  );
  assert.equal(f({ loc: ["body", "name"], msg: "Value error, name cannot be null" }), "Name cannot be empty.");
  assert.equal(f({ loc: ["body", "owner_id"], msg: "Field required", type: "missing" }), "Owner is required.");
  assert.equal(
    f({ loc: ["body"], msg: "Value error, due_date cannot be earlier than start_date" }),
    "Due date cannot be earlier than start date."
  );
  assert.equal(f({ loc: ["body", "due_date"], msg: "Input should be a valid date" }), "Due date must be a valid date.");
});
