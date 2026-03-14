# NONO-GATE

**Cryptographic CI Governance Engine**

Nono-Gate is a governance layer that sits above security scanners and converts their findings into deterministic decisions backed by cryptographic evidence.

Instead of trusting scanner outputs blindly, Nono-Gate produces:

- Deterministic governance decisions (ALLOW / BLOCK)
- Verifiable evidence bundles
- Cryptographic evidence roots
- Append-only transparency logs

This makes CI decisions auditable, reproducible, and tamper-evident.

---

# Architecture

Scanner (SARIF)
↓
Signals Extraction
↓
Consensus Engine
↓
Governance Decision
↓
Evidence Root (SHA256)
↓
Merkle Ledger
↓
Transparency Log

Nono-Gate does not replace scanners.  
It governs their outputs.

---

# Quick Demo

Run the governance pipeline locally:

.\signals\parse-sarif.ps1
.\signals\consensus-engine.ps1
.\decision\generate-decision.ps1
.\decision\fingerprint-decision.ps1
.\decision\build-evidence-root.ps1
.\decision\build-attestation.ps1
.\decision\generate-vdr.ps1
.\decision\append-ledger.ps1
.\decision\compute-ledger-merkle-root.ps1
.\decision\append-transparency-log.ps1

The pipeline will produce a governance decision and a verifiable evidence bundle.

---

# Evidence Bundle

Each run generates:

decision.json  
evidence_root_sha256.txt  
ledger_merkle_root.txt  
VDR (Verification Data Record)

These artifacts allow independent verification of CI governance decisions.

---

# Why Nono-Gate

Most tools answer:

"What vulnerabilities exist?"

Nono-Gate answers:

"Should this code be allowed to proceed?"

And it proves the decision cryptographically.

---

# Status

Prototype CI Governance Engine  
Deterministic pipeline working locally  
Evidence bundle generation verified

---

# Concept

Security scanners detect problems.  
Nono-Gate governs the decision.
