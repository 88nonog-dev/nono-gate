$s=Get-Content "$PSScriptRoot/../signals\sample-semgrep.sarif" | Out-String|ConvertFrom-Json;$r=$s.runs[0].results[0];$d=Get-Content "$PSScriptRoot/../decision\decision.json" | Out-String|ConvertFrom-Json;$e=@{decision=$d.decision;reason="error severity finding";rule_id=$r.ruleId;file=$r.locations[0].physicalLocation.artifactLocation.uri;line=$r.locations[0].physicalLocation.region.startLine;policy_trigger="block_on:error"};$e|ConvertTo-Json -Depth 5|Set-Content "$PSScriptRoot/../decision\decision-explanation.json"


