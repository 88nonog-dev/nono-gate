# NONO GATE v1.1 — Proof Index
Version: 1.0
Date: 2026-02-17

This index enumerates verifiable artifacts, policies, and workflows associated with the v1.1-enterprise lineage.

## 1) Integrity & Reproducibility
- Signed Git tag (v1.1-enterprise)
- Deterministic source export (ZIP + SHA256)
- Offline verifier script (external proof bundle)
- Cross-platform CI (rebuild-matrix)

Workflow:
- .github/workflows/rebuild-matrix.yml

## 2) Security & SCA Controls
- Dependency audit (npm audit)
- SARIF upload to GitHub Security
- Critical vulnerability enforcement
- Allowlist policy
- Dependency ledger anchor artifact

Workflow:
- .github/workflows/dependency-audit.yml

Policy:
- docs/dependency-allowlist.json
- docs/DEPENDENCY_POLICY.md

## 3) Release Governance
- Tag-based release gate
- PR-based validation workflow
- Deterministic install enforcement

Workflows:
- .github/workflows/release-gate.yml
- .github/workflows/release-pr.yml

## 4) Documentation & Audit Readiness
- Production Readiness Specification
  docs/PRODUCTION_READINESS.md

- External Audit Packet
  docs/EXTERNAL_AUDIT_PACKET.md

- Formal Threat Model
  docs/THREAT_MODEL.md

## 5) Assurance Boundary
The above artifacts provide:
- Reproducible builds
- Integrity anchoring
- Dependency risk control
- Release gating discipline

They do not assert:
- External security certification
- Infrastructure hardening
- Regulatory compliance

End of index.
