$ErrorActionPreference="Stop"

Write-Host "NONO-GATE PROOF DEMO START"

$demoRoot=Join-Path $PSScriptRoot "ci-demo"
if(!(Test-Path $demoRoot)){ throw "CI_DEMO_ROOT_NOT_FOUND: $demoRoot" }

Push-Location $demoRoot
try {
    .\signals\parse-sarif.ps1
    .\signals\consensus-engine.ps1
    .\decision\generate-decision.ps1
    .\decision\fingerprint-decision.ps1
    .\decision\build-evidence-root.ps1
    Copy-Item ".\decision\EVIDENCE_ROOT_SHA256.txt" "..\EVIDENCE_ROOT_SHA256.txt" -Force
    Copy-Item ".\decision\decision.json" "..\decision.json" -Force
    .\decision\build-attestation.ps1
    .\decision\generate-vdr.ps1
    .\decision\append-ledger.ps1
    .\decision\compute-ledger-merkle-root.ps1
    .\decision\append-transparency-log.ps1
}
finally {
    Pop-Location
}

Write-Host "NONO-GATE PROOF DEMO COMPLETE"
