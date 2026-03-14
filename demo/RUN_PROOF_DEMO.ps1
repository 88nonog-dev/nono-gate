$ErrorActionPreference="Stop"

Write-Host "NONO-GATE PROOF DEMO START"

cd $PSScriptRoot

.\signals\parse-sarif.ps1
.\signals\consensus-engine.ps1
.\decision\generate-decision.ps1
.\decision\fingerprint-decision.ps1
.\decision\build-evidence-root.ps1
.\decision\build-attestation.ps1
.\decision\generate-vdr.ps1
.\decision\append-ledger.ps1
.\decision\compute-ledger-merkle-root.ps1
.\decision\append-transparency-log.ps1
.\decision\verify-decision.ps1

Write-Host "NONO-GATE PROOF DEMO COMPLETE"
