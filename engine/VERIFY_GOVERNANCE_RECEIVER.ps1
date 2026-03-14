param(
  [Parameter(Mandatory=$true)][string]$RootDir,
  [Parameter(Mandatory=$true)][string]$PublicKeyPath,
  [string]$MinisignExe = "C:\Users\hp\AppData\Local\Microsoft\WinGet\Packages\jedisct1.minisign_Microsoft.Winget.Source_8wekyb3d8bbwe\minisign-win64\x86_64\minisign.exe"
)
$ErrorActionPreference="Stop"
function Fail([string]$m){ Write-Host ("GOVERNANCE_VERIFY=FAIL|"+$m); exit 2 }

if(!(Test-Path -LiteralPath $RootDir)){ Fail "ROOT_NOT_FOUND" }
if(!(Test-Path -LiteralPath $PublicKeyPath)){ Fail "PUBLIC_KEY_NOT_FOUND" }
if(!(Test-Path -LiteralPath $MinisignExe)){ Fail "MINISIGN_EXE_NOT_FOUND" }

$targets=@(
  @{ name="SNAPSHOT"; file="GOVERNANCE_SNAPSHOT.json" },
  @{ name="SEAL";     file="GOVERNANCE_SEAL.txt" },
  @{ name="IDENTITY"; file="GOVERNANCE_IDENTITY.json" },
  @{ name="BADGE";    file="GOVERNANCE_BADGE.json" }
)

function Sha256HexFile([string]$p){ (Get-FileHash -LiteralPath $p -Algorithm SHA256).Hash.ToLowerInvariant() }

foreach($t in $targets){
  $fp = Join-Path $RootDir $t.file
  $sig = $fp + ".minisig"
  $shaFile = $fp.Replace(".json",".sha256.txt"); if($fp -like "*.txt"){ $shaFile = $fp + ".sha256.txt" }

  if(!(Test-Path -LiteralPath $fp)){ Fail ("FILE_MISSING:"+$t.name) }
  if(!(Test-Path -LiteralPath $sig)){ Fail ("SIG_MISSING:"+$t.name) }
  if(!(Test-Path -LiteralPath $shaFile)){ Fail ("SHA_FILE_MISSING:"+$t.name) }

  try{
    & "$MinisignExe" -Vm "$fp" -x "$sig" -p "$PublicKeyPath" | Out-Null
  } catch {
    Fail ("MINISIGN_VERIFY_FAILED:"+$t.name)
  }

  $expect = (Get-Content -LiteralPath $shaFile -Encoding UTF8 | Select-Object -First 1).Trim().ToLowerInvariant()
  $got = (Sha256HexFile $fp)
  if($got -ne $expect){ Fail ("SHA256_MISMATCH:"+$t.name) }
}

$chain = Join-Path $RootDir "GOVERNANCE_CHAIN_ID.txt"
if(!(Test-Path -LiteralPath $chain)){ Fail "CHAIN_ID_NOT_FOUND" }
$cid = (Get-Content -LiteralPath $chain -Encoding UTF8 | Select-Object -First 1).Trim().ToLowerInvariant()
if($cid -notmatch "^[0-9a-f]{64}$"){ Fail "CHAIN_ID_INVALID" }

Write-Host "GOVERNANCE_VERIFY=PASS"
Write-Host ("CHAIN_ID="+$cid)
exit 0
