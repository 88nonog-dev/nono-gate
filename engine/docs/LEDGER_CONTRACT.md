# Global Append-Only Transparency Ledger — Contract (v1)

## Purpose
This ledger records *final governance outcomes* (post strict verification) as append-only entries.
Each run emits a cryptographic receipt enabling independent verification without re-running scan/fix logic.

This is a **trust layer**, not a feature.

## Scope (v1)
- Entry-per-run (one entry per enterprise run)
- Deterministic Merkle construction over appended entries
- Checkpoint chaining (tamper-evident history)
- Receipt with inclusion proof
- Independent verification mode

## Identifiers
- ledger_schema_id: `nono.transparency.ledger.v1`
- ledger_version: `1.0.0`
- entry_schema_id: `nono.transparency.entry.v1`
- checkpoint_schema_id: `nono.transparency.checkpoint.v1`
- receipt_schema_id: `nono.transparency.receipt.v1`

## Storage Model (Append-Only)
Ledger store directory (default):
- `.nono/ledger/`

Files (append-only unless stated):
- `entries.ndjson` (append-only) — one JSON object per line, each line is one Entry
- `checkpoints.ndjson` (append-only) — one JSON object per line, each line is one Checkpoint
- `latest.checkpoint.json` (derived) — may be regenerated from checkpoints, not required for verification

## Canonicalization (Deterministic)
All hashes MUST be computed over canonical UTF-8 bytes.

### JSON Canonicalization Rules
- UTF-8 encoding WITHOUT BOM
- No pretty-printing required; canonicalization is logical:
  - Objects: keys sorted lexicographically (codepoint order), recursively canonicalized
  - Arrays: order preserved, each element canonicalized
  - Numbers/booleans/strings/null preserved as values
- Serialization:
  - JSON.stringify(canonical(obj)) producing minimal JSON (no spaces/newlines)

### Forbidden (MUST NOT)
- Including local absolute paths, cwd, usernames, or machine-specific identifiers
- Including nondeterministic data as part of hashed payload (unless explicitly defined)

## Hash Function
- SHA-256, hex lowercase output

### Domain Separation
To prevent ambiguity:
- Leaf hash: `H(0x00 || entry_bytes)`
- Node hash: `H(0x01 || left_hash_bytes || right_hash_bytes)`
Where `H(x)` = SHA-256 over bytes.

Hashes in files are stored as hex; when hashing internal nodes, use raw 32-byte values.

## Merkle Tree Construction (Append Order)
- Entries are appended in order of creation.
- Leaves are computed from each Entry's canonical bytes.
- Tree is built over the ordered leaf list.
- If the leaf count is odd at a level, the last leaf is promoted upward unchanged (standard "carry" rule) unless otherwise specified by implementation; v1 standardizes to **carry**.

**Carry rule (v1):**
- If a level has an odd number of nodes, the final node is copied to the next level without hashing with itself.

## Entry (entry_schema_id: nono.transparency.entry.v1)
An Entry represents one finalized enterprise run.

### Required Fields
- `schema_id` (string) = entry_schema_id
- `ledger_version` (string) = ledger_version
- `created_utc` (string) — ISO 8601 UTC timestamp (NOT included in Merkle leaf hashing by default; see below)
- `run_id` (string) — deterministic run identifier (caller-provided preferred)
- `engine_version` (string)
- `bundle_fingerprint_sha256` (string, hex)
- `root_anchor_sha256` (string, hex) — hash of BUNDLE_ROOT_SHA256.txt contents or derived anchor (as defined by evidence)
- `contract_sha256` (string, hex)
- `architecture_sha256` (string, hex or empty)
- `decision_sha256` (string, hex)

### Hashing Payload (Entry Leaf Bytes)
To preserve determinism, leaf hashing uses `entry_hash_payload`, not raw entry:
- `entry_hash_payload` is the canonical JSON of:
  - schema_id, ledger_version, run_id, engine_version,
  - bundle_fingerprint_sha256, root_anchor_sha256,
  - contract_sha256, architecture_sha256, decision_sha256
- `created_utc` may exist for human/audit use but MUST NOT affect leaf hash in v1.

## Checkpoint (checkpoint_schema_id: nono.transparency.checkpoint.v1)
A Checkpoint commits the current Merkle root and links to the previous checkpoint (tamper-evident chain).

### Required Fields
- `schema_id` (string) = checkpoint_schema_id
- `ledger_version` (string) = ledger_version
- `created_utc` (string) — ISO 8601 UTC timestamp (may be present, not required for hash payload)
- `tree_size` (number) — total entries included
- `root_hash_sha256` (string, hex) — Merkle root at tree_size
- `prev_checkpoint_sha256` (string, hex or empty) — empty for genesis
- `checkpoint_sha256` (string, hex) — hash of checkpoint_hash_payload

### Hashing Payload (Checkpoint)
`checkpoint_hash_payload` is canonical JSON of:
- schema_id, ledger_version, tree_size, root_hash_sha256, prev_checkpoint_sha256

Then:
- `checkpoint_sha256 = SHA256( canonical_bytes(checkpoint_hash_payload) )`

## Receipt (receipt_schema_id: nono.transparency.receipt.v1)
A Receipt proves an Entry was included in a particular Checkpoint.

### Required Fields
- `schema_id` (string) = receipt_schema_id
- `ledger_version` (string) = ledger_version
- `entry` (object) — the Entry (may include created_utc)
- `entry_leaf_sha256` (string, hex) — leaf hash of entry_hash_payload
- `inclusion_proof` (array) — list of proof nodes in order from leaf to root:
  - each element: `{ "side": "L"|"R", "hash": "<hex>" }`
- `checkpoint` (object) — the Checkpoint object
- `computed_root_sha256` (string, hex) — root recomputed from leaf + proof

### Verification Rules
A verifier MUST:
1) Recompute leaf hash from entry_hash_payload and compare to entry_leaf_sha256
2) Recompute Merkle root using inclusion_proof and compare to checkpoint.root_hash_sha256
3) Validate checkpoint chain if ledger store provided:
   - checkpoint.checkpoint_sha256 must equal SHA256(canonical(checkpoint_hash_payload))
   - prev_checkpoint_sha256 must match the previous checkpoint_sha256
4) Optionally cross-check evidence bundle:
   - decision.json hash matches decision_sha256
   - bundle fingerprint matches bundle_fingerprint_sha256

## Independent Verification Mode
Verifier inputs:
- receipt path
- ledger store path (optional but recommended)

Verifier outputs (deterministic):
- PASS/FAIL
- error_code (stable)
- details (human readable)

### Error Codes (v1)
- LEDGER_INVALID_JSON
- LEDGER_SCHEMA_MISMATCH
- ENTRY_LEAF_HASH_MISMATCH
- MERKLE_ROOT_MISMATCH
- CHECKPOINT_HASH_MISMATCH
- CHECKPOINT_CHAIN_BROKEN
- TREE_SIZE_INVALID
- EVIDENCE_DECISION_HASH_MISMATCH (optional)
- EVIDENCE_FINGERPRINT_MISMATCH (optional)

## Forward Compatibility
v1 reserves fields:
- `event_type` (future)
- `sequence` (future)
- `policy_sha256` (future)

Future versions MUST remain verifiable for v1 receipts when using v1 rules.
