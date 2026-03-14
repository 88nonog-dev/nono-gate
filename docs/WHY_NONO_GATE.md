# WHY NONO-GATE

## Problem
Security scanners produce findings, but they do not provide a verifiable governance boundary for release decisions.

In many CI environments, teams can generate reports, but cannot prove:

- which exact findings were evaluated
- which exact policy was applied
- why a release was allowed or blocked
- that the decision artifacts were not modified after generation
- that decision history has not been rewritten

This creates an audit gap: results exist, but decision integrity is not provable.

---

## Why Scanners Are Not Enough
Scanners answer:

"What issues were detected?"

They do not answer, in a cryptographically verifiable way:

"Why was this release decision made, and can it be independently verified?"

A report can be regenerated or edited.
A pipeline can be misconfigured.
Artifacts can be overwritten.
History can be rewritten.

Without evidence binding and replay verification, the decision process is trust-based.

---

## What Nono-Gate Adds
Nono-Gate adds a deterministic governance layer that produces verifiable evidence:

1. **Deterministic decision generation**
   - Given the same inputs and policy, the decision artifacts are reproducible.

2. **Cryptographic evidence binding**
   - Decision artifacts are bound by SHA256 fingerprints and an Evidence Root.

3. **Replay verification**
   - Independent reviewers can recompute the Evidence Root from artifacts and confirm:
     - REPLAY VERIFIED
     - or detect tampering: TAMPER DETECTED

4. **Transparency history**
   - Decisions are appended to an immutable ledger.
   - A Merkle transparency root detects deletion or modification of historical entries.

5. **Portable evidence**
   - Evidence bundles can be shared for third-party verification without trusting the original CI environment.

---

## What Nono-Gate Guarantees
Nono-Gate guarantees the integrity of the decision process,
not the correctness of the security findings.

If a scanner output is wrong, Nono-Gate can still produce a verifiable decision — it cannot validate scanner truth.
It validates that the decision was derived from the provided artifacts and policy.

---

## Who This Helps
- security teams requiring audit-defensible release decisions
- organizations needing tamper-evident security governance evidence
- third-party auditors verifying governance integrity independently
- CI environments where reproducibility and decision traceability matter

---

## Related Documents
- Security Architecture: SECURITY_ARCHITECTURE.md
- Evidence Root Contract: EVIDENCE_ROOT_CONTRACT.md
- Demo Instructions: DEMO_INSTRUCTIONS.md
- Threat Model (core project): v1.3-deterministic-proven/docs/THREAT_MODEL.md
