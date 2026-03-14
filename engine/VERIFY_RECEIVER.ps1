param(
  [Parameter(Mandatory=$true)][string]$ZipPath,
  [Parameter(Mandatory=$true)][string]$PublicKey
)

if(!(Test-Path $ZipPath)){ throw "ZIP_NOT_FOUND" }
if(!(Test-Path "$ZipPath.minisig")){ throw "SIGNATURE_NOT_FOUND" }

Write-Host "== SHA256 =="
Get-FileHash -Algorithm SHA256 $ZipPath

Write-Host "== minisign verify =="
minisign -Vm $ZipPath -P $PublicKey

Write-Host "VERIFY_COMPLETE"
