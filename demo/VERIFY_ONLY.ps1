$ErrorActionPreference="Stop"

Write-Host "NONO-GATE INDEPENDENT VERIFICATION"

$decisionPath=Join-Path $PSScriptRoot "decision\verify-decision.ps1"

if(!(Test-Path $decisionPath)){
    throw "VERIFY_SCRIPT_NOT_FOUND"
}

& $decisionPath

Write-Host "VERIFICATION_COMPLETE"
