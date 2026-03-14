# NONO GATE v1.1 — Production Deployment Manual
Version: 1.0
Date: 2026-02-17

## 1. Purpose
This document defines the operational deployment and execution procedure
for NONO GATE v1.1 in controlled environments.

---

## 2. Supported Environment

### Runtime
- Node.js 20.x (validated in CI)
- npm 10+/11+ (validated in CI/local)

### Platforms
- Linux (ubuntu-latest CI)
- Windows (windows-latest CI)
- macOS (macos-latest CI)

---

## 3. Deterministic Installation

Production installation MUST use:

npm ci --ignore-scripts --no-audit --no-fund

Do NOT use:
npm install

Rationale:
- Ensures lockfile fidelity
- Prevents dependency drift
- Avoids implicit script execution

---

## 4. Execution Model

Typical execution:

node bin/nono.js <command>

Execution properties:
- Stateless per run
- No network requirement
- No secret persistence
- Exit codes must be honored

---

## 5. Security Controls in Production

Enforced via CI:
- rebuild-matrix workflow
- dependency-audit workflow
- release-gate workflow
- release-pr-validation workflow
- performance enforcement

Critical vulnerabilities block release.
Performance regression >25% blocks CI.

---

## 6. Release Procedure

1. Open PR to main
2. All CI workflows must pass
3. Merge PR
4. Create signed tag:
   git tag -s vX.Y.Z
   git push origin vX.Y.Z
5. release-gate validates tag

---

## 7. Dependency Governance

Allowlist file:
docs/dependency-allowlist.json

Rules:
- No silent suppression
- Justification required
- Reviewed in PR

Dependabot handles update proposals.

---

## 8. Performance Monitoring

perf-benchmark workflow:
- Measures npm_ci
- Measures npm_test
- Compares against baseline
- Blocks >25% regression

Artifacts stored in CI.

---

## 9. Operational Risks

Not covered:
- Infrastructure hardening
- Network perimeter security
- Host-level intrusion detection
- Secret management systems

These must be handled by deployment environment.

---

## 10. Assurance Statement

This production manual defines:
- Deterministic installation
- Controlled dependency governance
- Reproducible builds
- Performance regression control
- Release discipline

It does not assert external certification.

End of manual.
