[CmdletBinding()]
param(
    [switch]$SkipDocs,
    [switch]$WebOnly
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
. (Join-Path $PSScriptRoot 'lib\ProjectPaths.ps1')
$physicalRoot = Get-J2K26PhysicalRoot -LogicalRoot $repoRoot
$nodeVersion = (Get-Content -Raw (Join-Path $repoRoot ".node-version")).Trim()
$rustVersion = ((Get-Content -Raw (Join-Path $repoRoot "rust-toolchain.toml")) | Select-String 'channel\s*=\s*"([^"]+)"').Matches.Groups[1].Value
$toolsRoot = Join-Path $repoRoot ".tools"
$nodeFolder = "node-v$nodeVersion-win-x64"
$nodeRoot = Join-Path $toolsRoot $nodeFolder
$nodeExe = Join-Path $nodeRoot "node.exe"
$npmCmd = Join-Path $nodeRoot "npm.cmd"

New-Item -ItemType Directory -Force -Path $toolsRoot | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $repoRoot ".data") | Out-Null

if (-not (Test-Path -LiteralPath $nodeExe)) {
    if (-not $IsWindows) {
        throw "Automatic portable Node bootstrap currently supports Windows. Install Node $nodeVersion and rerun doctor."
    }

    $archiveName = "$nodeFolder.zip"
    $baseUrl = "https://nodejs.org/dist/v$nodeVersion"
    $archivePath = Join-Path ([IO.Path]::GetTempPath()) $archiveName
    $checksums = (Invoke-WebRequest -UseBasicParsing -Uri "$baseUrl/SHASUMS256.txt" -TimeoutSec 30).Content
    $checksumLine = ($checksums -split "\r?\n" | Where-Object { $_ -match "\s+$([regex]::Escape($archiveName))$" } | Select-Object -First 1)
    if (-not $checksumLine) {
        throw "The official checksum list does not contain $archiveName."
    }

    $expectedHash = ($checksumLine -split "\s+")[0].ToLowerInvariant()
    Invoke-WebRequest -UseBasicParsing -Uri "$baseUrl/$archiveName" -OutFile $archivePath -TimeoutSec 120
    $actualHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $archivePath).Hash.ToLowerInvariant()
    if ($actualHash -ne $expectedHash) {
        Remove-Item -LiteralPath $archivePath -Force
        throw "Node archive checksum mismatch. Expected $expectedHash, received $actualHash."
    }

    Expand-Archive -LiteralPath $archivePath -DestinationPath $toolsRoot -Force
    Remove-Item -LiteralPath $archivePath -Force
}

if (-not $WebOnly) {
    if (-not (Get-Command rustup -ErrorAction SilentlyContinue)) {
        throw "rustup is required for the full stack. Install it from https://rustup.rs/ or rerun with -WebOnly."
    }

    & rustup toolchain install $rustVersion --profile minimal --component rustfmt --component clippy
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to install Rust $rustVersion."
    }
}

if (-not $SkipDocs) {
    & pwsh -NoProfile -ExecutionPolicy Bypass -File (Join-Path $repoRoot "tools\Docs.ps1") -Action Setup
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to install or verify documentation dependencies."
    }
}

$webPackage = Join-Path $repoRoot "app\apps\web\package.json"
if (Test-Path -LiteralPath $webPackage) {
    $physicalWebPackage = Join-Path $physicalRoot 'app\apps\web\package.json'
    & $npmCmd ci --prefix (Split-Path $physicalWebPackage -Parent)
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to install web dependencies."
    }
}

$cargoManifest = Join-Path $repoRoot "app\Cargo.toml"
if (-not $WebOnly -and (Test-Path -LiteralPath $cargoManifest)) {
    & (Join-Path $PSScriptRoot 'rust-checks.ps1') -Action Fetch
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to fetch Rust dependencies."
    }
}

& (Join-Path $PSScriptRoot "doctor.ps1") -WebOnly:$WebOnly
