# Nono Gate × Nono Code — Integration Model (Strict, Enterprise)

## Decision (Final)
Adopt **Dual Engine + Thin Unified Orchestrator**:
- **nono-core**: produces scan/fix outputs (no governance claims)
- **nono-gate**: certifies outputs as admissible evidence (tamper-evident, root-anchored, contract-bound, architecture-locked)
- **nono** (enterprise wrapper): orchestrates core -> gate (no crypto/verify logic inside wrapper)

## Rationale
- Prevents self-attestation: Core never certifies itself; Gate never scans.
- Maximizes auditability and enterprise credibility.
- Enables enterprise pricing separation: Core (standard) vs Gate (enterprise).
- Reduces risk surface and improves reproducibility.

## Canonical Enterprise Flow (Golden Path)
1) Core runs (scan/fix/plan/apply/rollback) and writes **staging outputs**.
2) Gate runs strict certification (allowlist/unexpected detection, SHA set, contract hash injection, architecture lock, post-decision fingerprint, non-circular root anchor, FINAL_STRICT_PASS).
3) Optional signing (minisign) on the resulting bundle.

## Verify-Only Flow (Auditor/Buyer)
- Gate verifies a bundle without running core.
- Deterministic layout + stable sorting + canonical JSON are mandatory.

## Separation of Concerns (Hard Rules)
- Wrapper MUST NOT implement hashing, anchoring, signing, or strict verification.
- Core MUST NOT write BUNDLE_ROOT_SHA256.txt or FINAL_STRICT_PASS.
- Gate MUST NOT perform scanning or code modifications.

## Packaging
- Gate distributed as **Enterprise-only** component.
- Wrapper is the enterprise entrypoint; core may remain standard.
