# Nono-Gate

Deterministic Security Decision Gate for CI/CD

Nono-Gate is a security decision engine designed to make security outcomes deterministic, auditable, and verifiable in modern DevSecOps pipelines.

Instead of relying on opaque scanner results, Nono-Gate produces cryptographically verifiable security decisions backed by structured evidence.

---

## Why Nono-Gate

Modern CI security tools produce results that are often:

- Non-deterministic
- Hard to reproduce
- Difficult to audit
- Impossible to verify independently

Nono-Gate solves this by producing a deterministic decision artifact supported by:

- Evidence bundles
- Policy evaluation
- Ledger transparency
- Reproducible verification

---

## Core Concepts

### Security Decision

Each run produces a decision artifact:

decision.json

This file contains the final security decision for a build or change.

---

### Evidence Bundle

Every decision is backed by evidence:

EVIDENCE_BUNDLE.zip

Evidence may include:

- SARIF scan results
- normalized signals
- diffs
- metadata

---

### Deterministic Verification

Anyone can independently verify a decision.

Example:

./demo/VERIFY_ONLY.ps1

---

### Transparency Ledger

Security decisions are appended to a governance ledger:

governance-ledger.ndjson

This enables tamper detection and auditability.

---

## Demo

Run the full proof demo:

./demo/RUN_PROOF_DEMO.ps1

Verify a decision:

./demo/VERIFY_ONLY.ps1

---

## Project Structure

engine/      core security engine  
demo/        runnable demos  
docs/        documentation  
examples/    sample evidence & policies  
tests/       verification tests  

---

## Status

Research prototype for security and DevSecOps experimentation.

---

## Contributing

See CONTRIBUTING.md

---

## Security

See SECURITY.md

---

## License

See LICENSE
