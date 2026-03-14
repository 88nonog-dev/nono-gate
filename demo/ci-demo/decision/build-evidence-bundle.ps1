$base="$PSScriptRoot/../decision";$zip="$base\EVIDENCE_BUNDLE.zip";if(Test-Path $zip){Remove-Item $zip -Force};$files=@("decision.json","policy.json","security-consensus.json","DECISION_SHA256.txt","POLICY_SHA256.txt","EVIDENCE_ROOT_SHA256.txt","decision-attestation.json","REVIEW_RECEIPT.txt","governance-ledger.ndjson");$paths=@();foreach($f in $files){$p=Join-Path $base $f;if(Test-Path $p){$paths+=$p}};Compress-Archive -Path $paths -DestinationPath $zip;Write-Host "NONO-GATE: EVIDENCE BUNDLE CREATED"


