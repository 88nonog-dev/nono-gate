# NONO GATE v1.1 — Dependency Governance Policy
Version: 1.0
Date: 2026-02-17

## 1) Policy Objective
Ensure controlled, auditable, and risk-aware dependency management aligned with deterministic builds and release discipline.

## 2) Update Sources
- Dependabot PRs (weekly)
- Manual security advisories
- npm audit findings (CI)

## 3) Acceptance Rules

### 3.1 Security Updates
- Critical: must be reviewed immediately.
- High: reviewed within next release cycle.
- Moderate/Low: evaluated for impact before merging.

Critical vulnerabilities block release unless:
- Explicitly added to dependency-allowlist.json
- Justified in PR description
- Approved via PR review

### 3.2 Breaking Changes
- Major version bumps require:
  - CI green
  - Manual test verification
  - Rebuild validation
  - Explicit PR approval

### 3.3 Minor / Patch Updates
- Auto-merge permitted only if:
  - CI green
  - No new audit findings
  - No lockfile drift beyond dependency scope

## 4) Allowlist Governance
File: docs/dependency-allowlist.json

Rules:
- Must reference specific package name.
- Must include PR justification.
- Must not suppress critical issues silently.
- Removal required once upstream fix exists.

## 5) Release Coupling
Before tagging a release:
- rebuild-matrix must be green.
- dependency-audit must be green.
- No blocking critical vulnerabilities.
- Allowlist entries reviewed.

## 6) Audit Traceability
For each release:
- Dependency anchor artifact stored in CI artifacts.
- SHA256 hashes recorded.
- Commit and run ID traceable.

## 7) Prohibited Practices
- Direct push dependency upgrades to main.
- Editing lockfile without PR.
- Disabling audit enforcement.
- Silent allowlist expansion.

End of policy.
