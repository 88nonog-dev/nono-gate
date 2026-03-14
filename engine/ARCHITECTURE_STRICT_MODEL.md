# ARCHITECTURE_STRICT_MODEL.md
**nono-gate v1 — Deterministic Strict Evidence Engine**

## 1. Foundational Principle
nono-gate is not “just a SARIF gate”.
It produces a **Deterministic, Tamper-Evident, Cryptographically Bound Evidence Bundle**.

Any run output must be:
- reproducible
- verifiable
- tamper-evident (tampering is detectable)
- contract-bound

## 2. Non-Negotiable Principles

### 2.1 Determinism
Given the same:
- SARIF input
- baseline
- policy
- contract

→ the engine must yield the same decision and the same bundle fingerprint.

No randomness. No hidden state.

### 2.2 Contract Authority
`contract.json` is the authority that defines:
- `schema_id`
- `version`

It must be present (or auto-created deterministically), and its SHA256 must be computed and bound to the run output.

Any contract change → different hash → different fingerprint.

### 2.3 Layered Hash Binding
Binding is layered and strict:

1) `contract_sha256`
2) `decision.json` must embed `contract_sha256`
3) `bundle_fingerprint` = SHA256(canonical decision payload)
4) `SHA256SUMS.txt` covers all declared files
5) `BUNDLE_ROOT_SHA256.txt` seals the bundle root

Any deviation at any layer → verify MUST fail.

### 2.4 Strict Verification
`evidence verify` must fail on:
- missing file declared by manifest
- missing hash line for any manifest file
- SHA mismatch for any manifest file
- any unexpected file present (not in manifest)
- missing or invalid `BUNDLE_ROOT_SHA256.txt`

Strict means fail-fast. No auto-fix.

## 3. Evidence Bundle Model (Required Files)
Each bundle MUST include:

- `baseline_used.json`
- `normalized.json`
- `diff.json`
- `decision.json`
- `report.md`
- `contract.json`
- `contract.json.sha256`
- `SHA256SUMS.txt`
- `BUNDLE_ROOT_SHA256.txt`

Any add/remove outside this model must be detected by strict verify.

## 4. Decision Binding Rules
`decision.json` MUST include:
- `status`
- policy outputs
- `contract_sha256`
- `bundle_fingerprint`

Fingerprint MUST be computed **after** injecting `contract_sha256`.

## 5. Tamper Evidence Rules
Any modification to:
- `decision.json`
- `contract.json`
- `diff.json`
- `baseline_used.json`
- `report.md`

must be detected via SHA mismatch and/or root seal mismatch.

## 6. What This Engine Is NOT
- Not a static analyzer
- Not a CI framework
- Not a complex policy language engine

It is an **Evidence Gate**: deterministic decision + sealed bundle.

## 7. Stability & Freeze Policy
v1 freezes:
- evidence format
- hash ordering
- decision binding fields
- verification strictness

Breaking changes require v2. No silent behavioral changes.

## 8. Security Posture
Assume:
- filesystem is untrusted
- bundles are moved across machines
- verification occurs in a different environment

Verification must depend only on the bundle content (self-contained).

## 9. Engineering Integrity Rule
If “convenience” conflicts with strictness:
**strictness wins**.

Always.

