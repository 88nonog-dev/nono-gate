$ErrorActionPreference="Stop"
$base=(Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$sigDir=Join-Path $base "signals"
$decDir=Join-Path $base "decision"

$decisionFile=Join-Path $decDir "decision.json"
$policyFile=Join-Path $decDir "policy.json"
$consFile=Join-Path $decDir "security-consensus.json"
$decShaFile=Join-Path $decDir "DECISION_SHA256.txt"
$polShaFile=Join-Path $decDir "POLICY_SHA256.txt"
$evRootFile=Join-Path $decDir "EVIDENCE_ROOT_SHA256.txt"
$attFile=Join-Path $decDir "decision-attestation.json"
$ledgerFile=Join-Path $decDir "governance-ledger.ndjson"
$ledgerMerkleFile=Join-Path $decDir "LEDGER_MERKLE_ROOT_SHA256.txt"
$bundleZip=Join-Path $decDir "EVIDENCE_BUNDLE.zip"
$canonRules=Join-Path $decDir "CANONICAL_RULES.md"
$proofIndex=Join-Path $decDir "PROOF_INDEX.txt"
$replayCmd="pwsh -NoProfile -ExecutionPolicy Bypass -File `"$base/decision/replay-verify.ps1`""
foreach($p in @($sigDir,$decDir)){ if(!(Test-Path $p)){ throw "DIR_MISSING:$p" } }
foreach($p in @($decisionFile,$policyFile,$decShaFile,$polShaFile,$evRootFile,$ledgerFile,$ledgerMerkleFile)){ if(!(Test-Path $p)){ throw "REQUIRED_MISSING:$p" } }

$d=Get-Content -LiteralPath $decisionFile | Out-String | ConvertFrom-Json
$decision=($d.decision.ToString().Trim())
$decSha=(Get-Content -LiteralPath $decShaFile -Raw -Encoding UTF8).Trim()
$polSha=(Get-Content -LiteralPath $polShaFile -Raw -Encoding UTF8).Trim()
$evRoot=(Get-Content -LiteralPath $evRootFile -Raw -Encoding UTF8).Trim()
$ledgerMerkle=(Get-Content -LiteralPath $ledgerMerkleFile | Out-String).Trim()

$ledgerLines=Get-Content -LiteralPath $ledgerFile -Encoding UTF8 | Where-Object { $_ -ne "" }
$ledgerSeq=$ledgerLines.Count
$lastEntryJson=$null
if($ledgerSeq -gt 0){ try{ $lastEntryJson = ($ledgerLines[-1] | ConvertFrom-Json) } catch { $lastEntryJson = $null } }

# First SARIF (sorted), first result (if available) for human provenance fields
$sarifFiles=Get-ChildItem -LiteralPath $sigDir -Filter *.sarif -File | Sort-Object Name
if($sarifFiles.Count -eq 0){ throw "NO_SARIF_FILES_IN_SIGNALS" }
$sarifPath=$sarifFiles[0].FullName
$sarifName=$sarifFiles[0].Name
$s=Get-Content -LiteralPath $sarifPath | Out-String | ConvertFrom-Json
$tool=$null; try{ $tool=$s.runs[0].tool.driver.name } catch { $tool=$null }
if([string]::IsNullOrWhiteSpace($tool)){ $tool=[IO.Path]::GetFileNameWithoutExtension($sarifName) }
$first=$null; try{ $first=$s.runs[0].results[0] } catch { $first=$null }
$ruleId="";$level="";$uri="";$line=""
if($first -ne $null){
  try{ $ruleId=$first.ruleId } catch { $ruleId="" }
  try{ $level=($first.level.ToString().ToLower()) } catch { $level="" }
  try{ $uri=$first.locations[0].physicalLocation.artifactLocation.uri } catch { $uri="" }
  try{ $line=$first.locations[0].physicalLocation.region.startLine } catch { $line="" }
}

# Optional consensus summary
$consensusMode="";$consensusReason=""
if(Test-Path $consFile){
  try{ $c=Get-Content -LiteralPath $consFile | Out-String | ConvertFrom-Json; $consensusMode=$c.rule; $consensusReason=$c.reason } catch { $consensusMode=""; $consensusReason="" }
}

# Build provenance JSON
$prov=@{
  engine="nono-gate.decision-provenance.v1"
  deterministic=$true
  decision=$decision
  decision_sha256=$decSha
  policy_sha256=$polSha
  evidence_root_sha256=$evRoot
  ledger_seq=$ledgerSeq
  ledger_merkle_root_sha256=$ledgerMerkle
  primary_signal=@{
    sarif_file=$sarifName
    tool=$tool
    sample_result=@{ ruleId=$ruleId; level=$level; uri=$uri; startLine=$line }
  }
  consensus=@{ rule=$consensusMode; reason=$consensusReason }
  artifacts=@{
    decision_json="decision\decision.json"
    policy_json="decision\policy.json"
    consensus_json="decision\security-consensus.json"
    decision_sha="decision\DECISION_SHA256.txt"
    policy_sha="decision\POLICY_SHA256.txt"
    evidence_root="decision\EVIDENCE_ROOT_SHA256.txt"
    attestation="decision\decision-attestation.json"
    ledger="decision\governance-ledger.ndjson"
    ledger_merkle_root="decision\LEDGER_MERKLE_ROOT_SHA256.txt"
    review_receipt="decision\REVIEW_RECEIPT.txt"
    evidence_bundle_zip="decision\EVIDENCE_BUNDLE.zip"
    canonical_rules="decision\CANONICAL_RULES.md"
    proof_index="decision\PROOF_INDEX.txt"
  }
}
($prov | ConvertTo-Json -Depth 12) | Set-Content -LiteralPath (Join-Path $decDir "decision-provenance.json") -Encoding UTF8

# Build Verifiable Decision Receipt (VDR) — single auditor-facing file
$vdr=@()
$vdr+="NONO-GATE — VERIFIABLE DECISION RECEIPT (VDR)"
$vdr+="decision="+$decision
$vdr+="tool="+$tool
if($ruleId -ne ""){ $vdr+="ruleId="+$ruleId }
if($level -ne ""){ $vdr+="level="+$level }
if($uri -ne ""){ $vdr+="file="+$uri }
if($line -ne ""){ $vdr+="line="+$line }
if($consensusMode -ne ""){ $vdr+="consensus_rule="+$consensusMode }
if($consensusReason -ne ""){ $vdr+="consensus_reason="+$consensusReason }
$vdr+="decision_sha256="+$decSha
$vdr+="policy_sha256="+$polSha
$vdr+="evidence_root_sha256="+$evRoot
$vdr+="ledger_seq="+$ledgerSeq
$vdr+="ledger_merkle_root_sha256="+$ledgerMerkle
$vdr+="replay_verify_command="+$replayCmd
if(Test-Path $bundleZip){ $vdr+="evidence_bundle_zip="+$bundleZip }
if(Test-Path $attFile){ $vdr+="attestation_file="+$attFile }
if(Test-Path $canonRules){ $vdr+="canonical_rules="+$canonRules }
if(Test-Path $proofIndex){ $vdr+="proof_index="+$proofIndex }
$vdr | Set-Content -LiteralPath (Join-Path $decDir "VDR_RECEIPT.txt") -Encoding UTF8
Write-Host "NONO-GATE: VDR GENERATED"



