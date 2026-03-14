# Auditor Walkthrough — Independent Verification Guide

This document explains how an external auditor can independently verify:

- Integrity of the evidence bundle
- Deterministic behavior
- Merkle inclusion proof
- Ledger checkpoint consistency
- Tamper detection guarantees

No internal trust is required.

---

## 1. Verify Evidence Manifest (SHA256SUMS.txt)

Inside any evidence directory:

.nono/evidence/<RUN_ID>/

There is a file:

SHA256SUMS.txt

Steps:

1. Recompute SHA256 for each file (excluding SHA256SUMS.txt itself).
2. Compare with entries inside SHA256SUMS.txt.
3. Any mismatch = bundle tampering.

Expected property:
Deterministic and complete manifest.

---

## 2. Verify Bundle Root Anchor

File:

BUNDLE_ROOT_SHA256.txt

This root is computed from:

bundle_fingerprint + contract_sha256 + architecture_sha256

If any of those change:
→ Root changes.

Tampering guarantee:
Even modifying one byte in decision.json will change the root.

---

## 3. Verify Receipt Cryptographically

Command:

node bin/nono.js verify --receipt path/to/receipt.json

This verifies:

- entry_leaf_sha256 validity
- Merkle inclusion proof
- checkpoint root consistency

If proof fails:
MERKLE_ROOT_MISMATCH

If checkpoint does not match proof:
CHECKPOINT_ROOT_MISMATCH

---

## 4. Determinism Validation

Re-run the same inputs:

node bin/nono.js enterprise --staging <same> --policy <same> --run-id <same>

Expected:

- Identical SHA256SUMS.txt
- Identical BUNDLE_ROOT_SHA256
- Identical decision.bundle_fingerprint

This confirms:
Reproducible Governance.

---

## 5. Tamper Simulation (Auditor Test)

Auditor may:

- Modify normalized.json
- Modify diff.json
- Add unexpected file in staging
- Modify decision.json

Expected failures:

STAGING_DERIVATION_MISMATCH  
STAGING_UNEXPECTED_FILE  
Manifest mismatch  
Root mismatch  

System must fail safely.

---

## 6. Parallel Execution Safety

Multiple concurrent runs:

- Must produce independent evidence directories
- Must not corrupt ledger
- Must not invalidate previous receipts

Checkpoint mismatches across parallel runs do not invalidate individual receipts.

This was tested under parallel stress.

---

## 7. Threat Model Scope

This system protects against:

- Post-decision tampering
- Evidence mutation
- Result forgery
- Inclusion proof falsification
- Staging manipulation

Out of scope:

- Compromised host OS
- Compromised Node runtime
- Malicious policy definition by owner

---

## 8. Audit Confidence Summary

This system provides:

✔ Deterministic decision layer  
✔ Tamper-evident evidence bundle  
✔ Merkle transparency ledger  
✔ Independent receipt verification  
✔ Reproducibility guarantees  

Designed for enterprise governance workflows.

---

End of Auditor Walkthrough.
