[CmdletBinding()]
param(
    [ValidateSet('enabled', 'disabled', 'fast')]
    [string]$Thinking = 'fast',
    [switch]$Clear,
    [switch]$NoRestart
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

. (Join-Path $PSScriptRoot 'lib\ProjectPaths.ps1')
. (Join-Path $PSScriptRoot 'lib\AiCredentials.ps1')

$logicalRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$physicalRoot = Get-J2K26PhysicalRoot -LogicalRoot $logicalRoot
$paths = Get-J2K26AiCredentialPaths -PhysicalRoot $physicalRoot

if ($Clear) {
    if (Test-Path -LiteralPath $paths.Directory) {
        Remove-Item -LiteralPath $paths.Directory -Recurse -Force
    }
    Write-Host 'University2K26 local AI credential removed. Rules fallback remains available.' -ForegroundColor Yellow
    if (-not $NoRestart) {
        & (Join-Path $PSScriptRoot 'Stop-University2K26.ps1')
        & (Join-Path $PSScriptRoot 'Start-University2K26.ps1') -NoOpen
    }
    exit 0
}

if (-not $IsWindows) {
    throw 'This setup script stores the key with Windows DPAPI and must run in PowerShell on Windows.'
}

$secureKey = Read-Host 'Paste the Moonshot Open Platform API key (input is hidden)' -AsSecureString
if ($secureKey.Length -lt 16) {
    $secureKey.Dispose()
    throw 'No plausible API key was entered. Nothing was saved.'
}

New-Item -ItemType Directory -Path $paths.Directory -Force | Out-Null
$normalizedThinking = if ($Thinking -eq 'enabled') { 'enabled' } else { 'disabled' }
$configuration = [ordered]@{
    schema_version = '1.0.0'
    provider = 'moonshot'
    base_url = 'https://api.moonshot.cn/v1'
    model = 'kimi-k2.6'
    auth_mode = 'bearer'
    thinking = $normalizedThinking
    configured_at = (Get-Date).ToString('o')
    protection = 'windows-dpapi-current-user'
}

try {
    $encrypted = ConvertFrom-SecureString -SecureString $secureKey
    $encrypted | Set-Content -LiteralPath $paths.Secret -Encoding utf8NoBOM
    $configuration | ConvertTo-Json |
        Set-Content -LiteralPath $paths.Configuration -Encoding utf8
}
finally {
    $secureKey.Dispose()
    $encrypted = $null
}

$modeLabel = if ($normalizedThinking -eq 'disabled') {
    'Kimi K2.6 Fast (thinking disabled)'
}
else {
    'Kimi K2.6 Deep Thinking'
}
Write-Host "Saved $modeLabel in a Windows DPAPI-protected local store." -ForegroundColor Green
Write-Host 'The key is ignored by Git and is never passed in a command line or browser storage.'

if (-not $NoRestart) {
    & (Join-Path $PSScriptRoot 'Stop-University2K26.ps1')
    & (Join-Path $PSScriptRoot 'Start-University2K26.ps1') -NoOpen
    & (Join-Path $PSScriptRoot 'Test-University2K26-AI.ps1')
}
