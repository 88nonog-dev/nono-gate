# NONO-GATE — Deterministic Security Governance & Decision Transparency (Prototype)

## What this is
Nono-Gate is a security governance prototype that converts security tool findings (SARIF) into **deterministic, verifiable release decisions**.

It is **not** a scanner.
It is a governance layer that enforces integrity over the decision process:
- deterministic decision artifacts
- cryptographic evidence roots (SHA256)
- replay verification (tamper detection)
- append-only governance history + Merkle root
- external root anchoring
- security decision transparency log
- commit / CI binding via commit attestation

## Core question it answers
**Why was this release allowed or blocked — and can a third party verify it later without trusting the original CI run?**

## Repository layout
- `signals/` : SARIF ingestion and consensus evaluation
- `decision/` : decision generation + fingerprints + evidence + provenance
- `transparency/` : append-only transparency logs and root anchors
- `docs/` : documentation (this folder)
- `examples/sarif/` : place real SARIF files here

## Demonstration flow (high-level)
Repository Commit
↓
Security Signals (SARIF)
↓
Consensus Evaluation
↓
Governance Decision
↓
Decision Fingerprints (SHA256)
↓
Evidence Root
↓
Commit Attestation (commit ↔ decision ↔ root)
↓
Append-Only Governance Ledger
↓
Merkle Root (ledger transparency)
↓
External Root Anchor
↓
Security Transparency Log
↓
Replay Verification (REPLAY VERIFIED / TAMPER DETECTED)
↓
Anchor Verification (ROOT VERIFIED / ROOT NOT ANCHORED)

## Key artifacts
Located under `decision/` unless stated otherwise:

- `decision.json`
- `DECISION_SHA256.txt`
- `policy.json`
- `POLICY_SHA256.txt`
- `EVIDENCE_ROOT_SHA256.txt`
- `decision-attestation.json`
- `decision-provenance.json`
- `VDR_RECEIPT.txt`
- `governance-ledger.ndjson`
- `LEDGER_MERKLE_ROOT_SHA256.txt`
- `commit-attestation.json`
- `COMMIT_ATTESTATION_SHA256.txt`
- `ROOT_ANCHOR.log` (moved to `transparency/`)
- `security-transparency-log.ndjson` (moved to `transparency/`)

## Verification outputs
- Replay verification:
  - `NONO-GATE: REPLAY VERIFIED` if artifacts are consistent
  - `NONO-GATE: TAMPER DETECTED` if any artifact was modified
- Root anchoring verification:
  - `ROOT VERIFIED` if current root exists in `ROOT_ANCHOR.log`
  - `ROOT NOT ANCHORED` if the root is missing from the anchor log

## Status
This system is a **prototype architecture** (not a production security product).
It demonstrates the feasibility of deterministic, audit-defensible security governance decisions.

## Next step: run on a real SARIF file
1. Put a real SARIF file under `examples/sarif/`
2. Update the signal ingestion path (if needed) to point to that file
3. Run the pipeline and verify results
