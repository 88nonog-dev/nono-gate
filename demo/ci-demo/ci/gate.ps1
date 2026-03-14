$d=Get-Content "$PSScriptRoot/../decision\decision.json" | Out-String|ConvertFrom-Json;$v=$d.decision.Trim();if($v -eq "BLOCK"){Write-Host "NONO-GATE: RELEASE BLOCKED";exit 1}else{Write-Host "NONO-GATE: RELEASE ALLOWED";exit 0}


