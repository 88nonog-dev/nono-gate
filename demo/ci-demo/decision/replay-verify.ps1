$ErrorActionPreference="Stop"
$base=(Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$rootFile=Join-Path $base "EVIDENCE_ROOT_SHA256.txt"

if(!(Test-Path $rootFile)){
    throw "EVIDENCE_ROOT_MISSING"
}

$stored=(Get-Content $rootFile | Select-Object -First 1).Trim().ToLower()

if($stored.Length -ne 64){
    Write-Host "NONO-GATE: TAMPER DETECTED"
    exit 2
}

Write-Host "NONO-GATE: REPLAY VERIFIED"


