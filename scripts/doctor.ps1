[CmdletBinding()]
param(
    [switch]$Json
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
. (Join-Path $PSScriptRoot 'lib\ProjectPaths.ps1')
$nodeVersion = (Get-Content -Raw (Join-Path $repoRoot ".node-version")).Trim()
$rustVersion = ((Get-Content -Raw (Join-Path $repoRoot "rust-toolchain.toml")) | Select-String 'channel\s*=\s*"([^"]+)"').Matches.Groups[1].Value
$localNodeRoot = Join-Path $repoRoot ".tools\node-v$nodeVersion-win-x64"
$localNode = Join-Path $localNodeRoot "node.exe"
$localNpm = Join-Path $localNodeRoot "npm.cmd"
$checks = [System.Collections.Generic.List[object]]::new()

function Add-Check {
    param(
        [string]$Name,
        [bool]$Ok,
        [string]$Actual,
        [string]$Expected,
        [string]$Fix
    )

    $checks.Add([pscustomobject]@{
        name = $Name
        ok = $Ok
        actual = $Actual
        expected = $Expected
        fix = $Fix
    })
}

$gitVersion = (& git --version 2>&1 | Select-Object -First 1)
Add-Check "git" ($gitVersion -match "^git version ") $gitVersion "installed" "Install Git for Windows."

$remote = (& git -C $repoRoot remote get-url origin 2>$null)
Add-Check "canonical_remote" ($remote -eq "https://github.com/TianBingzhuo/Jiaowu2K26.git") ([string]$remote) "https://github.com/TianBingzhuo/Jiaowu2K26.git" "Clone the canonical GitHub repository or repair origin."

if (Test-Path -LiteralPath $localNode) {
    $actualNode = (& $localNode --version).TrimStart("v")
    $actualNpm = (& $localNpm --version)
    Add-Check "node" ($actualNode -eq $nodeVersion) $actualNode $nodeVersion "Run scripts/bootstrap.ps1."
    Add-Check "npm" ($actualNpm -eq "11.16.0") $actualNpm "11.16.0" "Run scripts/bootstrap.ps1."
} else {
    $globalNode = Get-Command node -ErrorAction SilentlyContinue
    $actualNode = if ($globalNode) { (& $globalNode.Source --version).TrimStart("v") } else { "not found" }
    Add-Check "node" ($actualNode -eq $nodeVersion) $actualNode $nodeVersion "Run scripts/bootstrap.ps1 to install the verified repository-local Node runtime."
    Add-Check "npm" $false "local runtime missing" "11.16.0" "Run scripts/bootstrap.ps1."
}

$rustup = Get-Command rustup -ErrorAction SilentlyContinue
if ($rustup) {
    $actualRust = (& rustup run $rustVersion rustc --version 2>$null | Select-Object -First 1)
    Add-Check "rust" ($actualRust -match "rustc $([regex]::Escape($rustVersion))") ([string]$actualRust) "rustc $rustVersion" "Run scripts/bootstrap.ps1."
} else {
    Add-Check "rust" $false "rustup not found" "rustc $rustVersion" "Install rustup, then run scripts/bootstrap.ps1."
}

$sacState = Get-J2K26SmartAppControlState
Add-Check "smart_app_control" $true $sacState "informational" "Keep protection enabled; the verifier selects WSL when enforcement blocks Rust proc-macro DLLs."
$hasUbuntu = Test-J2K26UbuntuWsl
$rustExecutor = if ($sacState -eq 'enforce' -and $hasUbuntu) { 'Ubuntu WSL2' } else { 'native Windows' }
$executorOk = $sacState -ne 'enforce' -or $hasUbuntu
Add-Check "rust_executor" $executorOk $rustExecutor "usable executor" "Install Ubuntu WSL2 or make a separate reviewed Smart App Control decision."

try {
    Get-Content -Raw (Join-Path $repoRoot "PROJECT-MANIFEST.json") | ConvertFrom-Json -Depth 100 | Out-Null
    Add-Check "manifest" $true "valid JSON" "valid JSON" ""
} catch {
    Add-Check "manifest" $false $_.Exception.Message "valid JSON" "Repair PROJECT-MANIFEST.json before continuing."
}

$docker = Get-Command docker -ErrorAction SilentlyContinue
Add-Check "docker_optional" $true ($(if ($docker) { (& docker --version 2>&1 | Select-Object -First 1) } else { "not installed; allowed" })) "optional" "Docker is not a required development path."

$result = [pscustomobject]@{
    schema_version = "1.0"
    repository = $repoRoot
    branch = (& git -C $repoRoot branch --show-current)
    checked_at = (Get-Date).ToString("o")
    platform = [System.Runtime.InteropServices.RuntimeInformation]::OSDescription
    architecture = [System.Runtime.InteropServices.RuntimeInformation]::OSArchitecture.ToString()
    checks = $checks
    ok = -not ($checks | Where-Object { -not $_.ok })
}

if ($Json) {
    $result | ConvertTo-Json -Depth 8
} else {
    $checks | Format-Table name, ok, actual, expected -AutoSize
    if (-not $result.ok) {
        Write-Host ""
        Write-Host "Remediation:" -ForegroundColor Yellow
        $checks | Where-Object { -not $_.ok } | ForEach-Object {
            Write-Host "- $($_.name): $($_.fix)" -ForegroundColor Yellow
        }
    }
}

if (-not $result.ok) {
    exit 1
}
