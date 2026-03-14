$base="$PSScriptRoot/../runs";if(!(Test-Path $base)){New-Item -ItemType Directory -Path $base|Out-Null};$id=(Get-Date).ToUniversalTime().ToString("yyyyMMdd-HHmmss");$dir="$base\run-$id";New-Item -ItemType Directory -Path $dir|Out-Null;Copy-Item "$PSScriptRoot/../signals\sample-semgrep.sarif" $dir;Copy-Item "$PSScriptRoot/../decision\decision.json" $dir;Copy-Item "$PSScriptRoot/../decision\DECISION_SHA256.txt" $dir;Copy-Item "$PSScriptRoot/../decision\POLICY_SHA256.txt" $dir -ErrorAction SilentlyContinue


