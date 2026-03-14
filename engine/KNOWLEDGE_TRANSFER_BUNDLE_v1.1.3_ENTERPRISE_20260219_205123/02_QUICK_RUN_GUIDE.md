# Quick Run Guide — 5 Minute Setup

This guide allows you to run Nono Gate Enterprise in under 5 minutes.

---

## Step 1 — Install Dependencies

npm ci

---

## Step 2 — Use Provided Example

Run this command:

node bin/nono.js enterprise ^
  --staging examples\acceptance\staging_good ^
  --policy examples\acceptance\policy.json ^
  --run-id QUICK_TEST

---

## Step 3 — Check Exit Code

0 → PASS
1 → FAIL

---

## Step 4 — Inspect Evidence

Open:

.nono\evidence\QUICK_TEST\

Files to check:
- decision.json
- report.md
- SHA256SUMS.txt
- BUNDLE_ROOT_SHA256.txt

---

## Step 5 — Verify Receipt

node bin/nono.js verify --receipt .nono\evidence\QUICK_TEST\receipt.json

If verification succeeds:
The bundle is cryptographically consistent.

---

## Common Errors

STAGING_MISSING_REQUIRED → staging incomplete
STAGING_UNEXPECTED_FILE → tampering detected
STAGING_DERIVATION_MISMATCH → normalized/diff mismatch

---

You have now executed a full deterministic governance cycle.

End of Quick Run Guide.
