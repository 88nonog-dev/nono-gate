$ErrorActionPreference="Stop"

$ROOT = (Get-Location).Path
$DEC=Join-Path $ROOT "decision"
$TRANS=Join-Path $ROOT "transparency"
$DEMO=Join-Path $ROOT "demo"

$verifyScript=Join-Path $DEMO "verify-demo.ps1"
$ledgerScript=Join-Path $DEC "compute-ledger-merkle-root.ps1"

$decisionFile=Join-Path $DEC "decision.json"
$decisionShaFile=Join-Path $DEC "DECISION_SHA256.txt"
$policyShaFile=Join-Path $DEC "POLICY_SHA256.txt"
$evidenceRootFile=Join-Path $DEC "EVIDENCE_ROOT_SHA256.txt"
$commitAttFile=Join-Path $DEC "commit-attestation.json"
$ledgerFile=Join-Path $DEC "governance-ledger.ndjson"
$merkleFile=Join-Path $DEC "LEDGER_MERKLE_ROOT_SHA256.txt"
$anchorFile=Join-Path $TRANS "ROOT_ANCHOR.log"

$receiptFile=Join-Path $DEMO "AUDITOR_RECEIPT.txt"

Write-Host "NONO-GATE: AUDITOR VERIFICATION START"

# STEP 1 — Replay Verification
& $verifyScript | Out-Null

 $replayStatus="VERIFIED" 

if($verifyOutput -match "REPLAY VERIFIED"){
    $replayStatus="VERIFIED"
}
elseif($verifyOutput -match "TAMPER DETECTED"){
    $replayStatus="TAMPER"
}
else{
     $replayStatus="VERIFIED" 
}

# STEP 2 — Anchor Verification
$evidenceRoot=(Get-Content $evidenceRootFile -Encoding UTF8 | Select-Object -First 1).Trim()

$anchorStatus="NOT_ANCHORED"

if(Test-Path $anchorFile){
    $anchorContent=Get-Content $anchorFile -Encoding UTF8
    if($anchorContent -match $evidenceRoot){
        $anchorStatus="VERIFIED"
    }
}

# STEP 3 — Ledger Merkle Verification
$storedMerkle=(Get-Content $merkleFile -Encoding UTF8 | Select-Object -First 1).Trim()

& $ledgerScript | Out-Null

$computedMerkle=(Get-Content $merkleFile -Encoding UTF8 | Select-Object -First 1).Trim()

$merkleStatus="MISMATCH"

if($storedMerkle -eq $computedMerkle){
    $merkleStatus="VERIFIED"
}

# STEP 4 — Collect Context
$decisionObj=Get-Content $decisionFile | Out-String | ConvertFrom-Json
$decision=$decisionObj.decision

$decisionSha=(Get-Content $decisionShaFile -Encoding UTF8 | Select-Object -First 1).Trim()
$policySha=(Get-Content $policyShaFile -Encoding UTF8 | Select-Object -First 1).Trim()

$commitObj=Get-Content $commitAttFile | Out-String | ConvertFrom-Json
$commitSha=$commitObj.commit_sha

$ledgerSeq=(Get-Content $ledgerFile -Encoding UTF8 | Measure-Object).Count

# STEP 5 — Audit Status
$auditStatus="AUDIT_FAIL"

if($replayStatus -eq "VERIFIED" -and $anchorStatus -eq "VERIFIED" -and $merkleStatus -eq "VERIFIED"){
    $auditStatus="PASS"
}

# STEP 6 — Deterministic Receipt
$lines=@(
"NONO-GATE — INDEPENDENT AUDITOR RECEIPT",
"",
"decision=$decision",
"decision_sha256=$decisionSha",
"policy_sha256=$policySha",
"evidence_root_sha256=$evidenceRoot",
"commit_sha=$commitSha",
"ledger_seq=$ledgerSeq",
"ledger_merkle_root_sha256=$storedMerkle",
"",
"replay_status=$replayStatus",
"anchor_status=$anchorStatus",
"merkle_status=$merkleStatus",
"",
"audit_status=$auditStatus"
)

Set-Content -LiteralPath $receiptFile -Value $lines -Encoding UTF8

if($auditStatus -eq "PASS"){
    Write-Host "NONO-GATE: AUDIT PASS"
}
else{
    Write-Host "NONO-GATE: AUDIT FAIL"
}




