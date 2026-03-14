# NONO-GATE — Evidence Root Contract

## Purpose
This document defines the deterministic algorithm used to compute the Evidence Root.

The Evidence Root represents the cryptographic state of a governance decision.

Replay verification must implement the exact same algorithm.

---

## Input Artifacts

The Evidence Root is derived from the SHA256 hashes of the following files:

1. signals\sample-semgrep.sarif
2. decision\decision.json
3. decision\policy.json
4. decision\DECISION_SHA256.txt

All files must exist before root computation.

---

## Hashing Algorithm

Each file is hashed individually using SHA256.

Example:

SHA256(file)

The resulting hashes are concatenated in the following order:

SHA256(sample-semgrep.sarif)
+ SHA256(decision.json)
+ SHA256(policy.json)
+ SHA256(DECISION_SHA256.txt)

The concatenated string is encoded using UTF-8.

The Evidence Root is then computed as:

SHA256(concatenated_hashes)

---

## Output

The resulting hash is written to:

EVIDENCE_ROOT_SHA256.txt

---

## Verification Rule

Replay verification must recompute the root using the same inputs and algorithm.

If the recomputed root equals the stored root:

REPLAY VERIFIED

Otherwise:

TAMPER DETECTED

---

## Determinism Requirements

The following properties must remain stable:

- file ordering
- hashing algorithm (SHA256)
- UTF-8 encoding
- hash concatenation order

Any change to these rules invalidates the contract.

---

## Contract Stability

This contract must remain stable across versions of Nono-Gate.

Any modification to the algorithm requires:

- contract version update
- backward compatibility documentation
