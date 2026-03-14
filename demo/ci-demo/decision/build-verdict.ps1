$s=Get-Content "$PSScriptRoot/../signals\sample-semgrep.sarif" | Out-String|ConvertFrom-Json;$levels=@($s.runs|ForEach-Object{$_.results}|ForEach-Object{$_.level.ToString().ToLower()});$errors=($levels|Where-Object{$_ -eq "error"}).Count;$verdict="PASS";if($errors -gt 0){$verdict="BLOCK"};$v=@{verdict=$verdict;confidence="high";signals_detected=$errors;severity_trigger="error";policy_applied="block_on:error";engine="nono-gate"};$v|ConvertTo-Json -Depth 5|Set-Content "$PSScriptRoot/../decision\security-verdict.json"


