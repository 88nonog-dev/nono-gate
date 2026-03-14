# CI Integration Guide — Enterprise Usage

This guide explains how to integrate Nono Gate Enterprise into CI/CD pipelines.

---

## 1. Basic CI Gate Pattern

node bin/nono.js enterprise ^
  --sarif results.sarif ^
  --policy policy.json ^
  --run-id CI_RUN

Exit Code:
0 → PASS
1 → FAIL

---

## 2. Deterministic CI Mode

Use explicit run-id derived from CI metadata:

PR number
Commit SHA
Build number

Example:
--run-id PR_1234_abcd1234

---

## 3. Evidence Archiving

Archive:
.nono/evidence/<RUN_ID>/

---

Nono Gate acts as a deterministic decision firewall between static analysis and production merge.

End of CI Integration Guide.
