param([Parameter(Mandatory=$true)][string]$RootDir,[Parameter(Mandatory=$true)][string]$PublicKeyPath)
$ErrorActionPreference="Stop"
$mini="C:\Users\hp\AppData\Local\Microsoft\WinGet\Packages\jidisct1.minisign_Microsoft.Winget.Source_8wekyb3d8bbwe\minisign-win64\x86_64\minisign.exe"

$snap=Join-Path $RootDir "GOVERNANCE_SNAPSHOT.json"
$seal=Join-Path $RootDir "GOVERNANCE_SEAL.txt"

if(!(Test-Path -LiteralPath $snap)) { throw "SNAPSHOT_NOT_FOUND" }
if(!(Test-Path -LiteralPath ($snap+".minisig"))) { throw "SNAPSHOT_MINISIG_NOT_FOUND" }
if(!(Test-Path -LiteralPath $seal)) { throw "SEAL_NOT_FOUND" }
if(!(Test-Path -LiteralPath ($seal+".minisig"))) { throw "SEAL_MINISIG_NOT_FOUND" }
if(!(Test-Path -LiteralPath $PublicKeyPath)) { throw "PUBLIC_KEY_NOT_FOUND" }

Write-Host "STEP1: VERIFY minisign"
& $mini -Vm $snap -p $PublicKeyPath -x ($snap+".minisig")
& $mini -Vm $seal -p $PublicKeyPath -x ($seal+".minisig")

Write-Host "STEP2: VERIFY SHA256 files"

$snapSha=Join-Path $RootDir "GOVERNANCE_SNAPSHOT.sha256.txt"
$sealSha=Join-Path $RootDir "GOVERNANCE_SEAL.sha256.txt"

if(!(Test-Path -LiteralPath $snapSha)) { throw "SNAPSHOT_SHA256_FILE_NOT_FOUND" }
if(!(Test-Path -LiteralPath $sealSha)) { throw "SEAL_SHA256_FILE_NOT_FOUND" }

$s1=(Get-FileHash -LiteralPath $snap -Algorithm SHA256).Hash.ToLower()
$e1=(Get-Content -LiteralPath $snapSha -Encoding UTF8 | Select-Object -First 1).Trim().ToLower()
if($s1 -ne $e1) { throw "SNAPSHOT_SHA256_MISMATCH" }

$s2=(Get-FileHash -LiteralPath $seal -Algorithm SHA256).Hash.ToLower()
$e2=(Get-Content -LiteralPath $sealSha -Encoding UTF8 | Select-Object -First 1).Trim().ToLower()
if($s2 -ne $e2) { throw "SEAL_SHA256_MISMATCH" }

Write-Host "SNAPSHOT_VERIFY=PASS"
