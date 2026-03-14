$s=(Get-Content "signals/input.sarif" | Out-String) | ConvertFrom-Json;$levels=@($s.runs|ForEach-Object{$_.results}|ForEach-Object{$_.level.ToString().ToLower()});$e=($levels|Where-Object{$_ -eq "error"}).Count;if($e -gt 0){"BLOCK"}else{"PASS"}




