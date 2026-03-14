$runs="$PSScriptRoot/../runs";$dirs=Get-ChildItem $runs -Directory|Sort-Object Name;if($dirs.Count -lt 2){Write-Host "NO_DIFF_AVAILABLE";exit};$prev=$dirs[$dirs.Count-2];$curr=$dirs[$dirs.Count-1];$p=Get-Content "$($prev.FullName)\decision.json" | Out-String|ConvertFrom-Json;$c=Get-Content "$($curr.FullName)\decision.json" | Out-String|ConvertFrom-Json;$change="no_change";if($p.decision -ne $c.decision){$change="decision_changed"};$d=@{previous=$p.decision;current=$c.decision;change=$change};$d|ConvertTo-Json -Depth 5|Set-Content "$PSScriptRoot/../decision\decision-diff.json"


