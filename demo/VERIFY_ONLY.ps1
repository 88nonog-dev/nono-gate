$ErrorActionPreference="Stop"

Write-Host "NONO-GATE INDEPENDENT VERIFICATION"

$decisionDir = Join-Path $PSScriptRoot "ci-demo\decision"

if(!(Test-Path $decisionDir)){
    throw "DECISION_DIR_NOT_FOUND"
}

Push-Location $decisionDir
try{
    .\verify-decision.ps1
}
finally{
    Pop-Location
}

Write-Host "VERIFICATION_COMPLETE"
