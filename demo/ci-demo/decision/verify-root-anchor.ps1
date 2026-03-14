$ErrorActionPreference="Stop"
$base=(Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$rootFile=Join-Path $base "EVIDENCE_ROOT_SHA256.txt"
$decFile =Join-Path $base "DECISION_SHA256.txt"
$logFile =Join-Path $base "ROOT_ANCHOR.log"

if(!(Test-Path $rootFile)){ throw "EVIDENCE_ROOT_MISSING:$rootFile" }
if(!(Test-Path $decFile)){ throw "DECISION_SHA_MISSING:$decFile" }

$root=(Get-Content $rootFile | Select-Object -First 1).Trim().ToLower()
$dec =(Get-Content $decFile  | Select-Object -First 1).Trim().ToUpper()

if(!(Test-Path $logFile)){
    Write-Host "ROOT NOT ANCHORED"
    exit 2
}

$lines=Get-Content $logFile

foreach($l in $lines){

    $parts=$l -split "\|"

    if($parts.Count -lt 3){ continue }

    $logRoot=$parts[1].Trim().ToLower()
    $logDec =$parts[2].Trim().ToUpper()

    if($logRoot -eq $root -and $logDec -eq $dec){
        Write-Host "ROOT VERIFIED"
        exit 0
    }

}

Write-Host "ROOT NOT ANCHORED"
exit 2


