# NONO-GATE — CANONICAL RULES (Deterministic Governance)

This document defines the deterministic rules used to ensure reproducible governance decisions and cryptographic evidence.

## 1) Encoding & Newlines
- All text artifacts MUST be UTF-8.
- Newlines are treated as LF in the logical model; scripts MUST trim trailing whitespace when comparing single-line tokens.
- Receipt / fingerprint files store single-line tokens and MUST be Trim()''d before comparisons.

## 2) JSON Determinism
- decision.json and policy.json are treated as semantic JSON artifacts.
- The governance decision value MUST be normalized (Trim) before enforcement.
- When JSON is produced by PowerShell ConvertTo-Json, it is accepted as the canonical writer for this prototype; consumers MUST parse JSON (ConvertFrom-Json) rather than string-match formatted JSON.

## 3) Evidence Root Inputs (Strict Order)
EVIDENCE_ROOT_SHA256 is computed from SHA256 hashes of the following files in THIS exact order:
1) signals\\*.sarif (current prototype uses signals\\sample-semgrep.sarif)
2) decision\\policy.json
3) decision\\decision.json
4) decision\\DECISION_SHA256.txt
5) decision\\POLICY_SHA256.txt

Algorithm:
- For each file in order: h_i = SHA256(file_bytes)
- concat = lower(h_1)+lower(h_2)+...+lower(h_n)
- EVIDENCE_ROOT_SHA256 = lower(SHA256(UTF8(concat)))

## 4) Attestation Binding
- decision-attestation.json binds: decision + decision_sha256 + policy_sha256 + evidence_root_sha256.
- Any change in signals/policy/decision MUST change evidence root and invalidate previous attestations.

## 5) Ledger Append-Only Rule
- governance-ledger.ndjson is append-only.
- Each new entry stores prev_entry_sha256 to link the chain.
- History edits are detectable because they change subsequent prev hashes.

## 6) Replay Verification
- replay-verify.ps1 MUST recompute EVIDENCE_ROOT_SHA256 from the canonical input order and compare to stored EVIDENCE_ROOT_SHA256.txt.
- Output MUST be either: 
  - NONO-GATE: REPLAY VERIFIED
  - NONO-GATE: TAMPER DETECTED

