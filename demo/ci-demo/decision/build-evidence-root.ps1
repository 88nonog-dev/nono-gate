$ErrorActionPreference = "Stop"

$base = $PSScriptRoot

$inputs = @(
    (Join-Path $base "decision.json")
    (Join-Path $base "policy.json")
    (Join-Path $base "security-consensus.json")
)

foreach($f in $inputs){
    if(!(Test-Path $f)){
        throw "INPUT_MISSING:$f"
    }
}

$hashes = foreach($f in $inputs){
    (Get-FileHash -Algorithm SHA256 -LiteralPath $f).Hash
}

$joined = ($hashes -join "`n")
$bytes = [System.Text.Encoding]::UTF8.GetBytes($joined)

$sha = [System.Security.Cryptography.SHA256]::Create()
$root = ($sha.ComputeHash($bytes) | ForEach-Object { $_.ToString("x2") }) -join ""

$out = Join-Path $base "EVIDENCE_ROOT_SHA256.txt"

Set-Content -LiteralPath $out -Value $root -Encoding UTF8

Write-Host "EVIDENCE_ROOT_GENERATED:$out"

