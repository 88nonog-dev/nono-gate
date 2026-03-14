# NONO-GATE — Architecture

## 1. Architectural intent
Nono-Gate is designed to provide **integrity, reproducibility, and auditability** for security release decisions.
It focuses on ensuring that a decision (ALLOW/BLOCK) can be verified later by a third party.

The system guarantees the integrity of the decision process and its evidence trail.
It does not guarantee scanner correctness or vulnerability detection completeness.

## 2. System layers

### 2.1 Signal ingestion layer (`signals/`)
Responsibilities:
- ingest SARIF findings
- normalize signals into a deterministic representation
- perform consensus evaluation based on defined rules/policies

Outputs:
- normalized signal representation used by the decision layer

### 2.2 Governance decision layer (`decision/`)
Responsibilities:
- evaluate signals against governance policy
- emit deterministic decision artifacts
- generate cryptographic fingerprints (SHA256)

Outputs:
- `decision.json`
- `DECISION_SHA256.txt`
- `policy.json`
- `POLICY_SHA256.txt`

### 2.3 Evidence layer (`decision/`)
Responsibilities:
- build an Evidence Root that binds the decision state to its inputs
- generate attestation and provenance artifacts

Outputs:
- `EVIDENCE_ROOT_SHA256.txt`
- `decision-attestation.json`
- `decision-provenance.json`
- `VDR_RECEIPT.txt`

### 2.4 Commit attestation binding (`decision/`)
Responsibilities:
- bind the governance decision to a specific code state

Outputs:
- `commit-attestation.json`
- `COMMIT_ATTESTATION_SHA256.txt`

### 2.5 Transparency layer (`decision/`, `transparency/`)
Responsibilities:
- append-only governance history (internal ledger)
- Merkle root for ledger transparency
- external root anchoring
- security decision transparency log (reviewable history)

Outputs:
- `governance-ledger.ndjson`
- `LEDGER_MERKLE_ROOT_SHA256.txt`
- `transparency/ROOT_ANCHOR.log`
- `transparency/security-transparency-log.ndjson`

### 2.6 Verification layer (`decision/`, demo scripts)
Responsibilities:
- replay verification to confirm artifact integrity
- anchor verification to confirm the root is externally recorded

Outputs:
- `NONO-GATE: REPLAY VERIFIED` or `NONO-GATE: TAMPER DETECTED`
- `ROOT VERIFIED` or `ROOT NOT ANCHORED`

## 3. Trust model summary
The prototype assumes:
- the decision artifacts are exported and later verified independently
- internal consistency alone is insufficient, hence external anchoring
- tamper detection is enforced through cryptographic binding and replay verification

## 4. Determinism and minimal complexity
Design choices emphasize:
- deterministic outputs from stable inputs
- append-only logs
- SHA256-based fingerprints
- minimal moving parts suitable for audit review

## 5. Prototype limitations
- no external transparency service integration (yet)
- no hardened CI runtime attestation
- no production deployment model
- operational threat modeling is limited compared to production systems
