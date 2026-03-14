# Nono-Gate Release Marker — v1.1 (Strict Derivation Locked)

Timestamp: 20260216_164753

## Status
- Unit Tests: PASS (jest)
- Acceptance Pack v1: COMPLETE (self-contained, deterministic)

## Enabled Guarantees
- Strict Verify: enabled
- Tamper Detection: enabled
- Unexpected File Detection: enabled (staging allowlist)
- Missing Required Detection: enabled
- Derivation Cross-Consistency: enabled
  - normalized.json must match normalizeSarif(sarif.json)
  - diff.json must match diffIssues(normalized, baseline_used.json)
- Root Anchor: BUNDLE_ROOT_SHA256.txt (non-circular)
- Contract: auto-create + hash injected into decision
- Architecture Lock: enforced when ARCHITECTURE_STRICT_MODEL.md present in CWD

## Acceptance Pack Cases (examples/acceptance)
- staging_good: PASS (produces EVIDENCE_DIR)
- staging_tampered_normalized: FAIL (STAGING_DERIVATION_MISMATCH:normalized)
- staging_tampered_diff: FAIL (STAGING_DERIVATION_MISMATCH:diff)
- staging_missing_required: FAIL (STAGING_MISSING_REQUIRED:baseline_used.json)
- staging_unexpected_file: FAIL (STAGING_UNEXPECTED_FILE:evil.txt)

## Notes
This marker is the baseline reference for building the Unified Orchestrator (nono wrapper).
No orchestrator changes are allowed to modify governance logic; it must remain inside nono-gate.
