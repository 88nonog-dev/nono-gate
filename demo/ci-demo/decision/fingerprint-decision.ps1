(Get-FileHash -Algorithm SHA256 "./decision/decision.json").Hash | Set-Content -LiteralPath "./decision/DECISION_SHA256.txt"


