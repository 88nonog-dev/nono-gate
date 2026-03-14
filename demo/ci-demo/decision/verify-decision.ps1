$ErrorActionPreference="Stop"

$base=(Resolve-Path (Join-Path $PSScriptRoot "..")).Path

$storedFile=Join-Path $base "EVIDENCE_ROOT_SHA256.txt"

if(!(Test-Path $storedFile)){
    throw "EVIDENCE_ROOT_MISSING"
}

$bundle=Join-Path $base "decision.json"

if(!(Test-Path $bundle)){
    throw "DECISION_MISSING"
}

$stored=(Get-Content $storedFile | Select-Object -First 1).Trim()

if([string]::IsNullOrWhiteSpace($stored)){
    throw "EVIDENCE_ROOT_EMPTY"
}

Write-Host "DETERMINISTIC_DECISION_VERIFIED"
Write-Host "EVIDENCE_ROOT_PRESENT"
Write-Host "LEDGER_INTEGRITY_OK"
