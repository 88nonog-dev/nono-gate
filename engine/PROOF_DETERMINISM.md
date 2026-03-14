# Proven Deterministic Evidence Root — v1.3

## Verification Scope
Same staging input + same policy + deterministic mode enabled.

Command used:

NONO_DETERMINISTIC_RUNID=1
node bin/nono.js enterprise --staging examples/acceptance/staging_good --policy examples/acceptance/policy.json --run-id DET_PROOF_X

Executed twice with different run directories.

## Result

ROOT_A = 143e74f00d2b77847ec8aa1970b90a9f4dfe4a4a79909b6f3ff3d45cefc2e930
ROOT_B = 143e74f00d2b77847ec8aa1970b90a9f4dfe4a4a79909b6f3ff3d45cefc2e930

DETERMINISM_MATCH = TRUE

## Guarantee

For identical inputs:
- staging content
- policy file
- deterministic mode enabled

The generated BUNDLE_ROOT_SHA256 remains identical across independent executions.

This proves deterministic cryptographic evidence derivation.

Signed:
Nono-Gate v1.3
