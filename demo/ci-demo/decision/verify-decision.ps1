$ErrorActionPreference="Stop"

$base=(Resolve-Path (Join-Path $PSScriptRoot "..")).Path

$storedFile=Join-Path $base "EVIDENCE_ROOT_SHA256.txt"

if(!(Test-Path $storedFile)){
    throw "EVIDENCE_ROOT_MISSING"
}

$stored=(Get-Content $storedFile | Select-Object -First 1).Trim().ToLower()

$bundle=Join-Path $base "decision.json"

if(!(Test-Path $bundle)){
    throw "DECISION_MISSING"
}

$computed=(Get-FileHash $bundle -Algorithm SHA256).Hash.ToLower()

if($computed.Substring(0,64) -eq $stored){
    Write-Host "DETERMINISTIC_DECISION_VERIFIED"
    Write-Host "EVIDENCE_ROOT_MATCH"
    Write-Host "LEDGER_INTEGRITY_OK"
}else{
    Write-Host "NONO-GATE: TAMPER DETECTED"
    exit 2
}
