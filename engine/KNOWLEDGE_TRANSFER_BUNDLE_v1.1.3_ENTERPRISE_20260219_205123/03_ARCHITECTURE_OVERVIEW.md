# Architecture Overview — Enterprise Model

Nono Gate Enterprise is designed as a governance layer above static analysis results.

It does NOT scan code directly.
It enforces decisions deterministically on top of SARIF output.

---

## High-Level Flow

Static Analyzer → SARIF → Normalization → Diff → Policy Decision → Evidence Bundle → Ledger → Receipt

---

## Core Components

1. Normalization Layer
   Converts SARIF into canonical normalized form.

2. Diff Engine
   Compares current findings against baseline.

3. Policy Engine
   Applies deterministic decision rules.

4. Evidence Generator
   Writes decision.json, diff.json, normalized.json and manifest.

5. Deterministic Manifest
   SHA256SUMS.txt (sorted, non-circular).

6. Bundle Root Anchor
   BUNDLE_ROOT_SHA256.txt derived from fingerprint + contract + architecture hash.

7. Transparency Ledger
   Merkle inclusion proof + checkpoint.

---

## Design Principles

Deterministic
Reproducible
Tamper-evident
Parallel-safe
Audit-oriented

---

## Trust Model

Trusted:
- Policy file
- Static analyzer output
- Execution environment

Protected Against:
- Post-decision tampering
- Evidence mutation
- Manifest manipulation
- Receipt forgery

---

## Parallel Safety

Each run produces independent evidence directory.
Ledger entries are append-only.
Checkpoint mismatches do not invalidate historical receipts.

---

## Why This Architecture Matters

It separates:
- Analysis logic
- Governance logic
- Integrity proof
- Audit transparency

This separation increases enterprise confidence and audit clarity.

End of Architecture Overview.
