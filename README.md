# Nono-Gate

Deterministic CI/CD Security Governance Architecture

Nono-Gate is a deterministic governance architecture for CI/CD pipelines that makes security release decisions provable, replay-verifiable, and independently auditable.

It does not replace scanners.
It operates as a decision-verification layer between security findings (such as SARIF outputs) and the release boundary.

Problem

Modern CI/CD security workflows generate results that are:

- difficult to reproduce
- difficult to audit
- difficult to justify later
- impossible to verify independently

Nono-Gate solves this by transforming the decision itself into a verifiable artifact.

Core Capabilities

- deterministic policy-based decision evaluation
- cryptographically bound evidence artifacts
- evidence root generation
- replay-verifiable decision outputs
- append-only governance ledger
- Merkle-based transparency integrity
- independent auditor verification

Architecture

Security findings -> policy evaluation -> deterministic decision -> evidence bundle -> ledger entry -> replay verification

Key Artifacts

decision.json
decision-attestation.json
decision-provenance.json
EVIDENCE_ROOT_SHA256.txt
governance-ledger.ndjson
LEDGER_MERKLE_ROOT_SHA256.txt

Demo

Run demo:

./demo/RUN_PROOF_DEMO.ps1

Verify decision:

./demo/VERIFY_ONLY.ps1

Repository Structure

engine/  core governance engine
demo/    runnable demo
docs/    architecture documentation
tests/   verification tests
examples/ sample evidence

Status

Research prototype for deterministic DevSecOps governance.

Start here

See START_HERE.md

