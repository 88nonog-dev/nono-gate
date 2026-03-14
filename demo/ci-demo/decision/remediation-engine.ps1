$s=Get-Content "$PSScriptRoot/../signals\sample-semgrep.sarif" | Out-String|ConvertFrom-Json;$r=$s.runs[0].results[0];$plan=@{rule=$r.ruleId;file=$r.locations[0].physicalLocation.artifactLocation.uri;line=$r.locations[0].physicalLocation.region.startLine;risk="cross-site scripting";recommended_fix="sanitize user input";example_patch="escapeHTML(userInput)";confidence="medium"};$plan|ConvertTo-Json -Depth 5|Set-Content "$PSScriptRoot/../decision\remediation-plan.json"


