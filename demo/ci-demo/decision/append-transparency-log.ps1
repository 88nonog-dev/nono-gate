$ErrorActionPreference="Stop"
$base=(Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$decision="$base\decision"
$trans="$base\transparency"

$ctx=Get-Content "$decision\commit-context.json" | Out-String | ConvertFrom-Json
$dec=Get-Content "$decision\decision.json" | Out-String | ConvertFrom-Json

$root=(Get-Content "$decision\EVIDENCE_ROOT_SHA256.txt").Trim()
$mroot=(Get-Content "$decision\LEDGER_MERKLE_ROOT_SHA256.txt").Trim()

$log="$trans\security-transparency-log.ndjson"

if(Test-Path $log){
 $seq=(Get-Content $log | Measure-Object).Count + 1
}else{
 $seq=1
}

$entry=@{
 seq=$seq
 timestamp=(Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
 repository=$ctx.repository
 commit_sha=$ctx.commit_sha
 decision=$dec.decision
 evidence_root=$root
 ledger_merkle_root=$mroot
} | ConvertTo-Json -Compress

Add-Content -LiteralPath $log -Value $entry -Encoding UTF8

Write-Host "TRANSPARENCY_LOG_UPDATED"


