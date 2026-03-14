$ErrorActionPreference="Stop"
$base=(Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$rootFile=Join-Path $base "EVIDENCE_ROOT_SHA256.txt"
$decFile=Join-Path $base "DECISION_SHA256.txt"
$logFile=Join-Path $base "ROOT_ANCHOR.log"

if(!(Test-Path $rootFile)){ throw "EVIDENCE_ROOT_MISSING:$rootFile" }
if(!(Test-Path $decFile)){ throw "DECISION_SHA_MISSING:$decFile" }

$root=(Get-Content -LiteralPath $rootFile -Encoding UTF8 | Select-Object -First 1).Trim().ToLower()
$dec =(Get-Content -LiteralPath $decFile  -Encoding UTF8 | Select-Object -First 1).Trim().ToUpper()

# NOTE: Timestamp is informational only; verification relies on root+decision presence in the log.
$ts = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")

$line = "$ts | $root | $dec"
Add-Content -LiteralPath $logFile -Value $line -Encoding UTF8

if(!(Test-Path $logFile)){ throw "ANCHOR_LOG_NOT_CREATED:$logFile" }
$last=(Get-Content -LiteralPath $logFile -Encoding UTF8 | Select-Object -Last 1).Trim()
if($last -ne $line){ throw "ANCHOR_APPEND_MISMATCH|EXPECTED=$line|GOT=$last" }

Write-Host "ROOT_ANCHORED"


