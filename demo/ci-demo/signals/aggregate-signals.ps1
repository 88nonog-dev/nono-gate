$dir="$PSScriptRoot/../signals";$files=Get-ChildItem $dir -Filter *.sarif;$errors=0;foreach($f in $files){$s=Get-Content $f.FullName | Out-String|ConvertFrom-Json;$levels=@($s.runs|ForEach-Object{$_.results}|ForEach-Object{$_.level.ToString().ToLower()});if(($levels|Where-Object{$_ -eq "error"}).Count -gt 0){$errors++}};if($errors -ge 1){"BLOCK"}else{"PASS"}


