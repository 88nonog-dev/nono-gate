$ErrorActionPreference="Stop"
$base="C:\Users\hp\Desktop\end-to-go\nono-gate-ci"
if(!(Test-Path $base)){ throw "BASE_NOT_FOUND:$base" }

$sigDir = Join-Path $base "signals"
$decDir = Join-Path $base "decision"
$ciDir  = Join-Path $base "ci"

$policy      = Join-Path $decDir "policy.json"
$policySha   = Join-Path $decDir "POLICY_SHA256.txt"
$decision    = Join-Path $decDir "decision.json"
$decisionSha = Join-Path $decDir "DECISION_SHA256.txt"

$consensusEngine = Join-Path $sigDir "consensus-engine.ps1"
$consensusOut    = Join-Path $decDir "security-consensus.json"

$evidenceRoot = Join-Path $decDir "EVIDENCE_ROOT_SHA256.txt"
$attestation  = Join-Path $decDir "decision-attestation.json"
$ledger       = Join-Path $decDir "governance-ledger.ndjson"

$receiptGen  = Join-Path $decDir "generate-review-receipt.ps1"
$bundleBuild = Join-Path $decDir "build-evidence-bundle.ps1"
$merkleBuild = Join-Path $decDir "compute-ledger-merkle-root.ps1"
$gate        = Join-Path $ciDir  "gate.ps1"

foreach($p in @($sigDir,$decDir,$ciDir)){ if(!(Test-Path $p)){ throw "DIR_MISSING:$p" } }
foreach($p in @($policy,$consensusEngine,$gate)){ if(!(Test-Path $p)){ throw "REQUIRED_MISSING:$p" } }

# 1) Consensus (writes decision\security-consensus.json and returns PASS/BLOCK)
$consensus = (& $consensusEngine).Trim()
if(!(Test-Path $consensusOut)){ throw "CONSENSUS_ARTIFACT_MISSING:$consensusOut" }

# 2) Decision.json from consensus (deterministic)
$dobj = @{ deterministic = $true; source = "consensus"; decision = $consensus }
($dobj | ConvertTo-Json -Depth 6) | Set-Content -LiteralPath $decision -Encoding UTF8

# 3) Fingerprints
(Get-FileHash -Algorithm SHA256 -LiteralPath $policy).Hash   | Set-Content -LiteralPath $policySha   -Encoding UTF8
(Get-FileHash -Algorithm SHA256 -LiteralPath $decision).Hash | Set-Content -LiteralPath $decisionSha -Encoding UTF8

# 4) Evidence Root (canonical order)
$sarifFiles = Get-ChildItem -LiteralPath $sigDir -Filter *.sarif -File | Sort-Object Name
if($sarifFiles.Count -eq 0){ throw "NO_SARIF_FILES_IN_SIGNALS" }

$order = @()
foreach($sf in $sarifFiles){ $order += $sf.FullName }
$order += $policy
$order += $decision
$order += $decisionSha
$order += $policySha

$hashes=@()
foreach($f in $order){
  if(!(Test-Path $f)){ throw "EVIDENCE_INPUT_MISSING:$f" }
  $hashes += (Get-FileHash -Algorithm SHA256 -LiteralPath $f).Hash.ToLower()
}

$concat = ($hashes -join "")
$sha = [System.Security.Cryptography.SHA256]::Create()
$root = (($sha.ComputeHash([Text.Encoding]::UTF8.GetBytes($concat)) | ForEach-Object ToString x2) -join "").ToLower()
Set-Content -LiteralPath $evidenceRoot -Encoding UTF8 -Value $root

# 5) Attestation
$decObj = Get-Content -LiteralPath $decision | Out-String | ConvertFrom-Json
$att = @{
  tool="nono-gate"
  deterministic=$true
  consensus=$true
  decision=($decObj.decision.ToString().Trim())
  decision_sha256=(Get-Content -LiteralPath $decisionSha -Raw -Encoding UTF8).Trim()
  policy_sha256=(Get-Content -LiteralPath $policySha | Out-String).Trim()
  evidence_root_sha256=$root
  signals_sarif_count=[int]$sarifFiles.Count
}
($att | ConvertTo-Json -Depth 10) | Set-Content -LiteralPath $attestation -Encoding UTF8

# 6) Ledger append-only
$prev="GENESIS"; $seq=1
if(Test-Path $ledger){
  $lines = Get-Content -LiteralPath $ledger -Encoding UTF8
  $seq = ($lines.Count + 1)
  if($lines.Count -gt 0){
    $last = $lines[-1]
    $prev = (Get-FileHash -Algorithm SHA256 -InputStream ([IO.MemoryStream]::new([Text.Encoding]::UTF8.GetBytes($last)))).Hash.ToLower()
  }
}
$entry = @{
  seq=$seq
  decision=$att.decision
  evidence_root_sha256=$root
  decision_sha256=$att.decision_sha256
  policy_sha256=$att.policy_sha256
  sarif_files=@($sarifFiles | ForEach-Object { $_.Name })
  prev_entry_sha256=$prev
}
Add-Content -LiteralPath $ledger -Encoding UTF8 -Value (($entry | ConvertTo-Json -Compress))

# 7) Merkle root (if available)
if(Test-Path $merkleBuild){ & $merkleBuild | Out-Null }

# 8) Review receipt (if available)
if(Test-Path $receiptGen){ & $receiptGen | Out-Null }

# 9) Evidence bundle (if available)
if(Test-Path $bundleBuild){ & $bundleBuild | Out-Null }

# 10) Enforce gate
& $gate


