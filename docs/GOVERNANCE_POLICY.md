# NONO-GATE — Governance Policy Model

## Purpose
This document defines the governance policy logic used by Nono-Gate to convert
security findings into release decisions.

Nono-Gate does not generate findings itself.  
It evaluates signals produced by external security tools.

The governance policy determines whether a release is:

ALLOW  
or  
BLOCK

---

## Policy Inputs

The governance decision is derived from:

- normalized security signals
- severity levels
- defined governance thresholds
- policy rules

Primary artifact used:

security-consensus.json

---

## Severity Model

Security findings are categorized into severity levels.

Typical levels include:

LOW  
MEDIUM  
HIGH  
CRITICAL

Severity classification is derived from scanner outputs or normalized during
signal processing.

---

## Governance Decision Logic

The governance engine evaluates the aggregated findings against policy rules.

### Example Policy

BLOCK if:

- any CRITICAL vulnerability exists
- any HIGH severity vulnerability exists
- security consensus indicates unresolved high-risk findings

ALLOW if:

- no HIGH or CRITICAL findings exist
- only LOW or informational findings remain

---

## Deterministic Decision Generation

The decision engine produces a deterministic artifact:

decision.json

The artifact contains:

- decision outcome (ALLOW or BLOCK)
- summary of evaluated findings
- references to input artifacts

---

## Decision Integrity

Each decision is cryptographically bound using:

DECISION_SHA256.txt

This ensures the decision cannot be modified without detection.

---

## Policy Integrity

The governance policy file is hashed using SHA256:

POLICY_SHA256.txt

This prevents silent policy modifications after decision generation.

---

## Relationship to Evidence Root

The governance policy contributes to the deterministic state represented by
the Evidence Root.

Evidence root inputs include:

- security signal inputs
- decision artifacts
- policy artifacts

The Evidence Root provides tamper detection for the entire decision state.

---

## Replay Verification

Replay verification recomputes the Evidence Root from the artifacts.

If the recomputed root matches:

REPLAY VERIFIED

If artifacts or policy were modified:

TAMPER DETECTED

---

## Policy Evolution

Policy rules may evolve over time.

To maintain auditability:

- policy versions should be tracked
- policy hashes must be preserved
- governance decisions must reference the policy version used

This ensures historical decisions remain reproducible.
