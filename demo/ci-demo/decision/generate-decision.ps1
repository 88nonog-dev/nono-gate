$r=(& "./signals/parse-sarif.ps1").Trim();$d=@{decision=$r;source="sarif";deterministic=$true};$d|ConvertTo-Json -Depth 5|Set-Content -LiteralPath "./decision/decision.json"



