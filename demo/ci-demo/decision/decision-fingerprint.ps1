$ErrorActionPreference="Stop"

$base=(Resolve-Path (Join-Path $PSScriptRoot "..")).Path

$decision=Join-Path $base "decision\decision.json"
$policy=Join-Path $base "decision\policy.json"
$root=Join-Path $base "EVIDENCE_ROOT_SHA256.txt"

if(!(Test-Path $decision)){ throw "DECISION_MISSING" }
if(!(Test-Path $policy)){ throw "POLICY_MISSING" }
if(!(Test-Path $root)){ throw "ROOT_MISSING" }

$dhash=(Get-FileHash $decision -Algorithm SHA256).Hash
$phash=(Get-FileHash $policy -Algorithm SHA256).Hash
$rhash=(Get-Content $root | Select-Object -First 1).Trim()

$combined="$dhash$phash$rhash"
$fingerprint=( [System.BitConverter]::ToString(
    (New-Object Security.Cryptography.SHA256Managed).ComputeHash(
        [System.Text.Encoding]::UTF8.GetBytes($combined)
    )
)).Replace("-","").ToLower()

Write-Host "DECISION_FINGERPRINT_SHA256:"
Write-Host $fingerprint
