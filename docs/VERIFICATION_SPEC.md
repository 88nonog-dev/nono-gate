# NONO-GATE — Verification Specification

## Purpose

This document defines the independent verification procedure for
Nono-Gate governance decisions.

The goal is to allow a third-party reviewer to validate that:

- decision artifacts were not modified
- governance evaluation was deterministic
- the evidence root correctly binds the decision state

The verification process must succeed without trusting the original
execution environment.

---

## Verification Inputs

The verification process uses the following artifacts:

signals/sample-semgrep.sarif

decision/decision.json  
decision/policy.json  
decision/DECISION_SHA256.txt  
decision/POLICY_SHA256.txt  
decision/EVIDENCE_ROOT_SHA256.txt  
decision/governance-ledger.ndjson  
decision/LEDGER_MERKLE_ROOT_SHA256.txt

---

## Derived Values

Verification recomputes:

1. SHA256(decision.json)
2. SHA256(policy.json)

The Evidence Root is recomputed using the defined contract:

EvidenceRoot =
SHA256(
    SHA256(signal) +
    SHA256(decision) +
    SHA256(policy) +
    DECISION_SHA256
)

The recomputed root must equal:

EVIDENCE_ROOT_SHA256.txt

---

## Replay Verification Logic

Steps:

1. Read stored Evidence Root
2. Recompute Evidence Root from artifacts
3. Compare values

If equal:

NONO-GATE: REPLAY VERIFIED

If different:

NONO-GATE: TAMPER DETECTED

---

## Tamper Detection Guarantee

Any modification to the following artifacts will cause verification failure:

- SARIF signals
- governance policy
- decision artifacts
- decision hash
- evidence root

The system therefore provides tamper-evident governance verification.

---

## Scope

Nono-Gate verifies integrity of the governance decision process.

It does not guarantee:

- correctness of scanner findings
- completeness of vulnerability detection
- absence of vulnerabilities

The system guarantees that the decision artifacts faithfully represent
the evaluated inputs and policy.
