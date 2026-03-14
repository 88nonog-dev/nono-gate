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



## Architecture Overview

Nono-Gate sits between security scanners and the release boundary.

Scanner Outputs (SARIF / Signals)
            ?
     Policy Evaluation
            ?
 Deterministic Decision Engine
            ?
     Evidence Generation
            ?
    Governance Ledger Entry
            ?
  Independent Replay Verification

This architecture allows security decisions to be:

- reproducible
- independently verifiable
- cryptographically bound to evidence
- auditable after the fact

Rather than trusting the scanner or CI logs alone, Nono-Gate enables verification of the final security decision artifact itself.



## Security Model

Nono-Gate assumes that CI environments and scanner outputs cannot always be trusted as final proof.

The system therefore focuses on **verifiable decision artifacts** rather than trusting execution environments.

Security properties targeted by the architecture:

- deterministic decision reproduction
- evidence binding via cryptographic hashes
- append-only governance ledger
- Merkle-based integrity for decision history
- replay verification of past decisions
- auditor-readable artifacts

This model allows security reviewers to validate decisions independently from the original CI pipeline.

In other words, verification does not require trusting the system that produced the decision.

