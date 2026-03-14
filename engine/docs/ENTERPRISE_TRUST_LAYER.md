# Enterprise Trust Layer (Nono Gate × Nono Code) — Proof-Backed Positioning

## What this is
This system is not a script. It is an **Evidence Governance Engine** with an **Append-Only Transparency Ledger**.
It turns each governance decision into a cryptographic object that can be independently audited.

## What it guarantees (proof-backed)
### 1) Deterministic evidence bundles
- Each enterprise run produces an evidence directory under:
  - `.nono/evidence/<RUN_ID>/`
- Deterministic manifest:
  - `SHA256SUMS.txt`
- Root anchor:
  - `BUNDLE_ROOT_SHA256.txt`

### 2) Contract-bound decision (tamper-evident)
- Contract artifact:
  - `contract.json`
  - `contract.json.sha256`
- Decision carries `contract_sha256` and is fingerprinted:
  - `decision.json` contains `contract_sha256` and `bundle_fingerprint`

### 3) Architecture lock (guarded model)
- Architecture model:
  - `ARCHITECTURE_STRICT_MODEL.md`
- Locked hash:
  - `ARCHITECTURE_SHA256.txt`
- Verified at run-time (guarded) and recorded into decision when present.

### 4) Global append-only transparency ledger (Merkle + checkpoint chain)
Ledger store:
- `.nono/ledger/entries.ndjson`  (append-only)
- `.nono/ledger/checkpoints.ndjson` (append-only, chained via `prev_checkpoint_sha256`)

Each ledger checkpoint commits the Merkle root over all appended entries:
- `checkpoint.root_hash_sha256`
- `checkpoint.checkpoint_sha256` (hash over canonical checkpoint payload)

### 5) Cryptographic receipt (inclusion proof)
Each run emits:
- `.nono/evidence/<RUN_ID>/TRANSPARENCY_RECEIPT.json`

Receipt includes:
- `entry_leaf_sha256`
- `inclusion_proof[]`
- `checkpoint.root_hash_sha256`
- `computed_root_sha256`

Verification rule:
- `computed_root_sha256` MUST equal `checkpoint.root_hash_sha256`
- Leaf+proof MUST recompute the same root

## Independent verification (no scan required)
A verifier can validate:
- Receipt integrity (leaf hash + inclusion proof → root)
- Checkpoint integrity (checkpoint_sha256 over canonical payload)
- Checkpoint chain (prev_checkpoint_sha256)
Optionally:
- Evidence decision hash and fingerprint (local evidence cross-check)

## No vague claims
This document makes **no comparisons** and no “market” claims.
Everything above maps to concrete artifacts produced by the system.

## Contract reference (ledger)
Ledger contract:
- `docs/LEDGER_CONTRACT.md`

## Minimal demo commands (operator)
1) Run enterprise mode:
- `node bin/nono.js enterprise --sarif sample.sarif --policy contract.json`

2) Inspect ledger:
- `.nono/ledger/entries.ndjson`
- `.nono/ledger/checkpoints.ndjson`

3) Inspect receipt:
- `.nono/evidence/<RUN_ID>/TRANSPARENCY_RECEIPT.json`

## What makes this enterprise-grade
- Deterministic evidence output
- Tamper-evident ledger history (append-only + chained checkpoints)
- Merkle-based inclusion receipts
- Independent audit path without re-running scan logic
- Clear contract & schema discipline
