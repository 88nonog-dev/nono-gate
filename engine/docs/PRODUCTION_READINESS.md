# NONO GATE v1.1 — Production Readiness Specification
Version: 1.0
Date: 2026-02-17
Artifact Tag: v1.1-enterprise
Commit: 219f65773f7bc7b1f03ff3a4f81693371c15a80f

## 1) Deployment Model
- Execution mode: local CLI invocation (no daemon).
- Network dependency: not required for verification; execution is local.
- External services: none assumed.

## 2) Runtime Requirements
- Node.js: validated in CI on Node 20; local verification also executed on Node v24.8.0.
- npm: CI uses setup-node; local verification executed on npm 11.6.0.
- Filesystem: standard Windows/Linux/macOS semantics supported (CI matrix passed).

## 3) Installation Method
Deterministic install (recommended):
- npm ci --ignore-scripts --no-audit --no-fund

Non-deterministic install (not recommended for evidence workflows):
- npm i

## 4) Configuration / Environment Variables
- Required env vars: none documented for core operation at this time.
- If introduced later: must be explicitly documented (name, purpose, defaults, failure behavior).

## 5) Secrets Management
- Current scope: no secret storage and no credential handling.
- If secrets are introduced later: must be injected via environment/secret manager; must not be stored in repo; must not be logged.

## 6) Logging / Telemetry
- Output: console output for operational feedback.
- Telemetry: none assumed.
- Persistent logs/rotation: not provided within current scope.

## 7) Failure Model
Expected failure conditions include (non-exhaustive):
- dependency installation failure
- test suite failure
- integrity or ledger validation failure (when applicable to the executed path)
Requirement:
- non-zero exit code on failure; no silent failure behavior.

## 8) Upgrade / Release Discipline
- Release identifier: signed Git tag.
- Integrity anchoring: tag signature verification.
- Deterministic export: git archive (ZIP) with published SHA256.
- Rebuild proof: reproducible test execution with proof bundle + offline verifier.

## 9) Operational Risk Notes (Observed)
- Node VM Modules warning observed during tests: experimental runtime note.
- Deprecated transitive dependencies observed (e.g., inflight/glob): no remediation performed within verification scope.

## 10) Status Declaration
Verified within scope:
- cryptographic tag integrity (SSH signed tag)
- deterministic source export (ZIP SHA256)
- deterministic rebuild + tests
- cross-platform CI validation (ubuntu/windows/macos)
Not asserted:
- external security audit
- threat model coverage beyond documented assumptions
- dependency vulnerability remediation (CVE/SCA)
- production hardening, performance benchmarking, long-run stability
