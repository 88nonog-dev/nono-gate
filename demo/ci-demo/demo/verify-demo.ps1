$ErrorActionPreference="Stop"

Write-Host "NONO-GATE: STARTING REPLAY VERIFICATION"

$base=(Get-Location).Path
$decision=Join-Path $base 'decision'
$trans=Join-Path $base 'transparency'

# recompute root using the same official script
& (Join-Path $decision "build-evidence-root.ps1")

$stored=(Get-Content (Join-Path $decision 'EVIDENCE_ROOT_SHA256.txt') -Encoding UTF8 | Select-Object -First 1).Trim()
$recalc=(Get-Content (Join-Path $decision 'EVIDENCE_ROOT_SHA256.txt') -Encoding UTF8 | Select-Object -First 1).Trim()

if($stored -eq $recalc){
 Write-Host "NONO-GATE: REPLAY VERIFIED"
}else{
 Write-Host "NONO-GATE: TAMPER DETECTED"
}

Write-Host "NONO-GATE: CHECKING ROOT ANCHOR"

$anchor=Join-Path $trans 'ROOT_ANCHOR.log'

if(Test-Path $anchor){
 $a=Get-Content -LiteralPath $anchor -Encoding UTF8
 if($a -match [regex]::Escape($stored)){
  Write-Host "ROOT VERIFIED"
 }else{
  Write-Host "ROOT NOT ANCHORED"
 }
}else{
 Write-Host "ROOT ANCHOR LOG MISSING"
}

Write-Host "NONO-GATE: VERIFICATION COMPLETE"
