$d=Get-Content "$PSScriptRoot/../decision\decision.json" | Out-String|ConvertFrom-Json;$f=Get-Content "$PSScriptRoot/../decision\DECISION_SHA256.txt";$r=Get-Content "$PSScriptRoot/../decision\EVIDENCE_ROOT_SHA256.txt";$a=@{tool="nono-gate";decision=$d.decision;decision_sha256=$f;evidence_root=$r;timestamp=(Get-Date).ToUniversalTime().ToString("o")};$a|ConvertTo-Json -Depth 5|Set-Content -LiteralPath "$PSScriptRoot/../decision\decision-attestation.json"


