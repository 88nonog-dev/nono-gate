# Nono Gate — Staging Spec (Core -> Gate Contract)

This document defines the **strict contract** between Nono-Code Core (producer) and Nono-Gate (certifier).
Gate must only trust the staging directory and must enforce allowlist + unexpected file detection.

## Staging Root
.nono/staging/<runId>/

## Required Files
- sarif.json
- normalized.json
- diff.json
- baseline_used.json
- core_run_meta.json

## Optional Files (Allowed)
- report.md
- fix_plan.json
- apply_log.txt
- results.sarif

## Rules
- Any file outside (Required + Optional) MUST fail strict verification (unexpected file).
- All JSON files must be UTF-8 (no BOM) and parseable.
- Filenames are case-sensitive for hashing/manifest purposes.

## Evidence Bundle Mapping
Gate will copy the staging set into:
.nono/evidence/<runId>/
and then add governance artifacts:
- decision.json
- contract.json (raw bytes)
- ARCHITECTURE_STRICT_MODEL.md (if present)
- ARCHITECTURE_SHA256.txt (if present/created)
- BUNDLE_ROOT_SHA256.txt
- report.md (summary)

