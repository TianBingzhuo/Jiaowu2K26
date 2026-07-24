[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

. (Join-Path $PSScriptRoot 'lib\ProjectPaths.ps1')

$logicalRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$physicalRoot = Get-J2K26PhysicalRoot -LogicalRoot $logicalRoot
$runtimeFile = Join-Path $physicalRoot '.data\university2k26-v09\runtime.json'

if (-not (Test-Path -LiteralPath $runtimeFile)) {
    Write-Host 'No University2K26 runtime record was found; nothing was stopped.'
    exit 0
}

$runtime = Get-Content -LiteralPath $runtimeFile -Raw | ConvertFrom-Json
foreach ($property in 'web_pid', 'api_pid') {
    $pidValue = $runtime.$property
    if ($pidValue) {
        $process = Get-Process -Id $pidValue -ErrorAction SilentlyContinue
        if ($process) {
            Stop-Process -Id $pidValue
            Write-Host "Stopped $property ($pidValue)."
        }
    }
}

Remove-Item -LiteralPath $runtimeFile
