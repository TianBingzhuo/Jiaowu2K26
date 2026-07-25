[CmdletBinding()]
param(
    [ValidateSet('Fetch', 'Verify')]
    [string]$Action = 'Verify',
    [ValidateSet('auto', 'windows', 'wsl')]
    [string]$Executor = 'auto'
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

. (Join-Path $PSScriptRoot 'lib\ProjectPaths.ps1')

$logicalRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$physicalRoot = Get-J2K26PhysicalRoot -LogicalRoot $logicalRoot
$manifest = Join-Path $physicalRoot 'app\Cargo.toml'
$rustVersion = ((Get-Content -Raw (Join-Path $physicalRoot 'rust-toolchain.toml')) |
    Select-String 'channel\s*=\s*"([^"]+)"').Matches.Groups[1].Value
$sacState = Get-J2K26SmartAppControlState
$hasUbuntu = Test-J2K26UbuntuWsl

if ($Executor -eq 'auto') {
    $Executor = if ($sacState -eq 'enforce' -and $hasUbuntu) { 'wsl' } else { 'windows' }
}

if ($Executor -eq 'wsl') {
    if (-not $hasUbuntu) {
        throw 'Rust executor is WSL, but the Ubuntu distribution is unavailable. Install Ubuntu WSL2 or choose a reviewed Windows policy path.'
    }
    $driveRoot = [IO.Path]::GetPathRoot($physicalRoot)
    if (-not $driveRoot -or $driveRoot.Length -lt 2 -or $driveRoot[1] -ne ':') {
        throw "The repository is not on a drive that Ubuntu WSL can map: $physicalRoot"
    }
    $drive = $driveRoot[0].ToString().ToLowerInvariant()
    $relative = $physicalRoot.Substring($driveRoot.Length).Replace('\', '/')
    $wslRoot = "/mnt/$drive/$relative"
    if ($wslRoot.Contains("'")) {
        throw "The WSL repository path contains an apostrophe and cannot be passed safely: $wslRoot"
    }
    $quotedRoot = $wslRoot
    $commands = if ($Action -eq 'Fetch') {
        'cargo fetch --manifest-path app/Cargo.toml --locked'
    }
    else {
        @(
            'cargo fmt --manifest-path app/Cargo.toml --all -- --check',
            'cargo check --manifest-path app/Cargo.toml --workspace --all-targets --locked',
            'cargo test --manifest-path app/Cargo.toml --workspace --all-targets --locked',
            'cargo clippy --manifest-path app/Cargo.toml --workspace --all-targets --locked -- -D warnings'
        ) -join ' && '
    }
    $bash = "source ~/.cargo/env 2>/dev/null || { echo 'Rust is missing in Ubuntu WSL. Install rustup $rustVersion first.' >&2; exit 127; }; " +
        "rustc --version | grep -q '^rustc $rustVersion ' || { rustc --version >&2; exit 126; }; " +
        "cd '$quotedRoot' && export CARGO_TARGET_DIR=~/.cache/jiaowu2k26/target && $commands"
    Write-Host "[J2K26] Rust executor: Ubuntu WSL2 (Smart App Control: $sacState)" -ForegroundColor Cyan
    & wsl.exe -d Ubuntu -- bash -lc $bash
    if ($LASTEXITCODE -ne 0) { throw "Rust $Action failed in Ubuntu WSL (exit $LASTEXITCODE)." }
    exit 0
}

if ($sacState -eq 'enforce') {
    throw 'Smart App Control is enforcing and blocks locally generated Rust proc-macro DLLs. Keep protection enabled and use Ubuntu WSL2, or make a separate reviewed security decision.'
}

$env:CARGO_TARGET_DIR = Join-Path $physicalRoot '.data\cargo-target'
$cargoArguments = if ($Action -eq 'Fetch') {
    @('cargo', 'fetch', '--manifest-path', $manifest, '--locked')
}
else {
    $null
}
Write-Host "[J2K26] Rust executor: native Windows (Smart App Control: $sacState)" -ForegroundColor Cyan
if ($Action -eq 'Fetch') {
    & rustup run $rustVersion @cargoArguments
    if ($LASTEXITCODE -ne 0) { throw "Rust Fetch failed on Windows (exit $LASTEXITCODE)." }
    exit 0
}

& rustup run $rustVersion cargo fmt --manifest-path $manifest --all -- --check
if ($LASTEXITCODE -ne 0) { throw 'cargo fmt failed.' }
& rustup run $rustVersion cargo check --manifest-path $manifest --workspace --all-targets --locked
if ($LASTEXITCODE -ne 0) { throw 'cargo check failed.' }
& rustup run $rustVersion cargo test --manifest-path $manifest --workspace --all-targets --locked
if ($LASTEXITCODE -ne 0) { throw 'cargo test failed.' }
& rustup run $rustVersion cargo clippy --manifest-path $manifest --workspace --all-targets --locked -- -D warnings
if ($LASTEXITCODE -ne 0) { throw 'cargo clippy failed.' }
