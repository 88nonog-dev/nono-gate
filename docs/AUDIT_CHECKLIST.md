# NONO-GATE — Audit Checklist (Third-Party Verification)

## Scope
This checklist allows an independent security engineer to verify that Nono-Gate produces a deterministic, tamper-evident governance decision and that replay verification works without trusting the original execution environment.

All operations must remain under:

C:\Users\hp\Desktop\end-to-go

---

## 0. Preconditions

- PowerShell available
- Access to the demo environment:
  - demo\
  - nono-gate-ci\
- No files should be created outside end-to-go

Expected: reviewer can read files under end-to-go.

---

## 1. Documentation Review (Quick)

Confirm presence of these files:

- WHY_NONO_GATE.md
- SECURITY_ARCHITECTURE.md
- GOVERNANCE_POLICY.md
- EVIDENCE_ROOT_CONTRACT.md
- DEMO_INSTRUCTIONS.md
- AUDIT_CHECKLIST.md

Threat Model reference (core project):

- v1.3-deterministic-proven/docs/THREAT_MODEL.md

Expected: docs are present and consistent.

---

## 2. Run the Demo Pipeline (One Command)

Run:

demo\run-demo.ps1

Expected:
- pipeline steps execute
- governance decision artifacts created under:
  nono-gate-ci\decision

Minimum expected artifacts:
- decision.json
- DECISION_SHA256.txt
- POLICY_SHA256.txt
- EVIDENCE_ROOT_SHA256.txt
- decision-attestation.json
- decision-provenance.json
- VDR_RECEIPT.txt
- governance-ledger.ndjson
- LEDGER_MERKLE_ROOT_SHA256.txt
- EVIDENCE_BUNDLE.zip

Expected confirmation: pipeline completes without error.

---

## 3. Replay Verification (One Command)

Run:

demo\verify-demo.ps1

Expected terminal output:

NONO-GATE: REPLAY VERIFIED

This confirms:
- evidence root recomputation matches stored root
- artifacts are consistent and unchanged
- verification does not require trusting the original environment

---

## 4. Tamper Test (Expected Failure)

Goal: demonstrate tamper detection.

Procedure (manual):
- Modify one artifact inside:
  nono-gate-ci\decision
  (Example: append a newline to decision.json)

Then run:

demo\verify-demo.ps1

Expected terminal output:

NONO-GATE: TAMPER DETECTED

This confirms:
- any artifact modification breaks root equality
- tampering cannot be hidden without detection

---

## 5. Evidence Bundle Portability (Optional)

Confirm evidence bundle exists:

nono-gate-ci\decision\EVIDENCE_BUNDLE.zip

Auditor may copy the bundle to a separate isolated folder under end-to-go and validate that replay verification still works (if verifier supports bundle-only flow).

Expected:
- evidence bundle contains all required artifacts for verification

---

## 6. Audit Conclusions

If the following conditions hold:

- demo pipeline completes successfully
- replay verification returns REPLAY VERIFIED
- tamper test returns TAMPER DETECTED

Then the demo proves:

- deterministic governance decision generation
- cryptographic evidence binding
- tamper-evident artifacts
- third-party reproducible verification

