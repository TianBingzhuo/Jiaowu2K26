[CmdletBinding()]
param(
    [switch]$SkipDocs
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

. (Join-Path $PSScriptRoot 'lib\ProjectPaths.ps1')

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$physicalRoot = Get-J2K26PhysicalRoot -LogicalRoot $repoRoot
$nodeVersion = (Get-Content -Raw (Join-Path $repoRoot ".node-version")).Trim()
$rustVersion = ((Get-Content -Raw (Join-Path $repoRoot "rust-toolchain.toml")) | Select-String 'channel\s*=\s*"([^"]+)"').Matches.Groups[1].Value
$nodeRoot = Join-Path $repoRoot ".tools\node-v$nodeVersion-win-x64"
$nodeExe = Join-Path $nodeRoot "node.exe"
$npmCmd = Join-Path $nodeRoot "npm.cmd"

& (Join-Path $PSScriptRoot "doctor.ps1")
if ($LASTEXITCODE -ne 0) {
    throw "Environment doctor failed."
}

Get-Content -Raw (Join-Path $repoRoot "PROJECT-MANIFEST.json") | ConvertFrom-Json -Depth 100 | Out-Null

& $nodeExe (Join-Path $repoRoot 'scripts\check-contracts.mjs')
if ($LASTEXITCODE -ne 0) { throw "Contract verification failed." }

$cargoManifest = Join-Path $repoRoot "app\Cargo.toml"
if (Test-Path -LiteralPath $cargoManifest) {
    & (Join-Path $PSScriptRoot 'rust-checks.ps1') -Action Verify
    if ($LASTEXITCODE -ne 0) { throw "Rust verification failed." }
}

$webPackage = Join-Path $physicalRoot "app\apps\web\package.json"
if (Test-Path -LiteralPath $webPackage) {
    & $npmCmd run verify --prefix (Split-Path $webPackage -Parent)
    if ($LASTEXITCODE -ne 0) { throw "Web verification failed." }
}

if (-not $SkipDocs) {
    & pwsh -NoProfile -ExecutionPolicy Bypass -File (Join-Path $repoRoot "tools\Docs.ps1") -Action Update
    if ($LASTEXITCODE -ne 0) { throw "Documentation verification failed." }
}

Write-Host "All enabled Phase 0 checks passed." -ForegroundColor Green
