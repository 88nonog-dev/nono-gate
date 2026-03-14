# START HERE

Nono-Gate quick start.

## What this repository demonstrates

This repository demonstrates a deterministic CI/CD security governance architecture that turns security release decisions into verifiable artifacts.

Instead of treating CI security as scanner output only, Nono-Gate treats the final decision itself as something that can be reproduced, audited, and independently verified later.

## Fastest path

1. Run the demo

./demo/RUN_PROOF_DEMO.ps1

2. Verify the decision output

./demo/VERIFY_ONLY.ps1

3. Inspect the generated artifacts

decision.json
decision-attestation.json
decision-provenance.json
EVIDENCE_ROOT_SHA256.txt
governance-ledger.ndjson

## What to look for

Focus on these properties:

- deterministic decision output
- cryptographically bound evidence
- replay-verifiable result
- append-only governance history
- auditor-friendly proof artifacts

## Main repository areas

demo/     runnable demo flow
engine/   core governance engine
docs/     architecture and verification documentation
tests/    validation and regression coverage

## Recommended reading order

1. README.md
2. START_HERE.md
3. docs/SECURITY_ARCHITECTURE.md
4. docs/VERIFICATION_SPEC.md
5. demo/README.md

## Intended audience

This project is most relevant to:

- DevSecOps engineers
- AppSec platform architects
- software supply-chain security teams
- technical auditors
- security product leaders

