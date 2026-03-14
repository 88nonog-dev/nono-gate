# NONO GATE v1.1 — Formal Threat Model
Version: 1.0
Date: 2026-02-17
Artifact Tag: v1.1-enterprise
Commit: 219f65773f7bc7b1f03ff3a4f81693371c15a80f

## 1) System Context
The system operates as a local CLI artifact.
Verification is deterministic and does not require network access.
Integrity is anchored to a signed Git tag and SHA256 hashes.

## 2) Trust Assumptions
- SSH signing key integrity.
- SHA256 collision resistance.
- Node runtime correctness (documented version).
- Lockfile integrity.
- Local filesystem integrity during verification.

## 3) Assets
- Tagged source integrity.
- Deterministic rebuild reproducibility.
- Proof bundle integrity.
- CI validation evidence.

## 4) Threats Considered
- Post-tag source tampering.
- Artifact substitution.
- Proof bundle modification.
- Dependency drift.
- Replay of stale evidence.

## 5) Mitigations
- Signed Git tag verification.
- Deterministic source export with published SHA256.
- npm ci lockfile enforcement.
- Cross-platform CI validation.
- Offline verifier script validating hash integrity.

## 6) Out of Scope
- Kernel or hardware compromise.
- Signing key compromise.
- Nation-state adversaries.
- Full application vulnerability review.
- Regulatory compliance.

## 7) Boundary Statement
This model provides integrity and reproducibility guarantees
for the tagged artifact within a local deterministic environment.
No broader security guarantees are asserted.

End of document.
