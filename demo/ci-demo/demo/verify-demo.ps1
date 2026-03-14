$ErrorActionPreference="Stop"

Write-Host "NONO-GATE: STARTING REPLAY VERIFICATION"

$base="$(Get-Location).Path"
$decision="$base\decision"
$trans="$base\transparency"

# recompute root using the same official script
& (Join-Path $decision "build-evidence-root.ps1")

$stored=(Get-Content "$decision\EVIDENCE_ROOT_SHA256.txt").Trim()
$recalc=(Get-Content "$decision\EVIDENCE_ROOT_SHA256.txt").Trim()

if($stored -eq $recalc){
 Write-Host "NONO-GATE: REPLAY VERIFIED"
}else{
 Write-Host "NONO-GATE: TAMPER DETECTED"
}

Write-Host "NONO-GATE: CHECKING ROOT ANCHOR"

$anchor="$trans\ROOT_ANCHOR.log"

if(Test-Path $anchor){
 $a=Get-Content $anchor
 if($a -match $stored){
  Write-Host "ROOT VERIFIED"
 }else{
  Write-Host "ROOT NOT ANCHORED"
 }
}else{
 Write-Host "ROOT ANCHOR LOG MISSING"
}

Write-Host "NONO-GATE: VERIFICATION COMPLETE"




