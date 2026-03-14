# NONO-GATE — Third-Party Reproducible Verification Demo (Deterministic)

## Scope
This demo proves that Nono-Gate can produce a deterministic governance decision from a SARIF security signal and that the decision can be independently verified via replay verification without trusting the original execution environment.

## Working Directory (Strict)
All work stays under:
C:\Users\hp\Desktop\end-to-go

Project root:
C:\Users\hp\Desktop\end-to-go\nono-gate-ci

Demo inputs:
C:\Users\hp\Desktop\end-to-go\demo

## What This Demo Shows (Pipeline)
SARIF Signal
→ Consensus Evaluation
→ Governance Policy
→ Deterministic Decision
→ Cryptographic Fingerprints (SHA256)
→ Evidence Root
→ Decision Attestation
→ Decision Provenance (VDR)
→ Append-Only Ledger
→ Merkle Transparency Root
→ Evidence Bundle
→ Replay Verification (REPLAY VERIFIED / TAMPER DETECTED)

## Inputs
- demo\signals\sample-semgrep.sarif
- demo\vulnerable-app\app.js

## Produced Artifacts (under nono-gate-ci\decision)
- decision.json
- DECISION_SHA256.txt
- POLICY_SHA256.txt
- EVIDENCE_ROOT_SHA256.txt
- decision-attestation.json
- decision-provenance.json
- VDR_RECEIPT.txt
- governance-ledger.ndjson
- LEDGER_MERKLE_ROOT_SHA256.txt
- EVIDENCE_BUNDLE.zip

## How to Run (One Command)
Run:
demo\run-demo.ps1

Expected: artifacts created + hashes computed.

## How to Verify (One Command)
Verify:
demo\verify-demo.ps1

Expected:
NONO-GATE: REPLAY VERIFIED

## Tamper Test (Expected Failure)
If any artifact changes after generation, replay verification must return:
NONO-GATE: TAMPER DETECTED

## Determinism Notes (Audit)
- Evidence root calculation must match replay verification algorithm exactly.
- All hashes are SHA256 and are printed/stored for independent checking.

---

## Reference Architecture

The demo environment is intentionally separated from the main project.

The actual Nono-Gate source repository is located at:

C:\Users\hp\Desktop\end-to-go\v1.3-deterministic-proven

Security documentation including the system threat model is available at:

v1.3-deterministic-proven/docs/THREAT_MODEL.md

This demo environment only contains the minimal pipeline required to demonstrate:

- deterministic governance decision generation
- cryptographic evidence binding
- replay verification

The purpose of the demo is to allow independent reviewers to verify the security
properties of the system without modifying the original project repository.

