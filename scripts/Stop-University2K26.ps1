[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

. (Join-Path $PSScriptRoot 'lib\ProjectPaths.ps1')

$logicalRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$physicalRoot = Get-J2K26PhysicalRoot -LogicalRoot $logicalRoot
$runtimeFile = Join-Path $physicalRoot '.data\university2k26-v09\runtime.json'

if (Test-J2K26UbuntuWsl) {
    $driveRoot = [IO.Path]::GetPathRoot($physicalRoot)
    $drive = $driveRoot[0].ToString().ToLowerInvariant()
    $relative = $physicalRoot.Substring($driveRoot.Length).Replace('\', '/')
    $wslRoot = "/mnt/$drive/$relative"
    & wsl.exe -d Ubuntu -- bash -lc "cd '$wslRoot' && bash scripts/stop-api-dev.sh"
}

if (Test-Path -LiteralPath $runtimeFile) {
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
}
