[CmdletBinding()]
param(
    [switch]$NoOpen,
    [switch]$FixtureOnly
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

. (Join-Path $PSScriptRoot 'lib\ProjectPaths.ps1')

$logicalRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$physicalRoot = Get-J2K26PhysicalRoot -LogicalRoot $logicalRoot
$nodeVersion = (Get-Content -Raw (Join-Path $physicalRoot '.node-version')).Trim()
$nodeExe = Join-Path $physicalRoot ".tools\node-v$nodeVersion-win-x64\node.exe"
$viteEntry = Join-Path $physicalRoot 'app\apps\web\node_modules\vite\bin\vite.js'
$webRoot = Join-Path $physicalRoot 'app\apps\web'
$runtimeRoot = Join-Path $physicalRoot '.data\university2k26-v09'
$runtimeFile = Join-Path $runtimeRoot 'runtime.json'

New-Item -ItemType Directory -Path $runtimeRoot -Force | Out-Null

function Test-Url {
    param([Parameter(Mandatory)][string]$Url)
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 2
        return $response.StatusCode -ge 200 -and $response.StatusCode -lt 500
    }
    catch {
        return $false
    }
}

$apiProcess = $null
if (-not $FixtureOnly -and -not (Test-Url -Url 'http://127.0.0.1:3000/api/v1/health')) {
    if (-not (Test-J2K26UbuntuWsl)) {
        throw 'The full-stack launcher currently requires Ubuntu WSL2. Use -FixtureOnly for the portable Web demo, or follow docs/GETTING-STARTED.md for a manual native backend launch.'
    }

    $driveRoot = [IO.Path]::GetPathRoot($physicalRoot)
    $drive = $driveRoot[0].ToString().ToLowerInvariant()
    $relative = $physicalRoot.Substring($driveRoot.Length).Replace('\', '/')
    $wslRoot = "/mnt/$drive/$relative"
    # A WSL process can outlive its Windows wsl.exe wrapper after a host sleep
    # or tool restart. If the Windows health probe failed, stop only the API
    # whose scoped PID receipt belongs to this project before starting again.
    & wsl.exe -d Ubuntu -- bash -lc "cd '$wslRoot' && bash scripts/stop-api-dev.sh"
    if ($LASTEXITCODE -ne 0) {
        throw 'Unable to clean up the previous University2K26 WSL API process.'
    }
    $apiStdout = Join-Path $runtimeRoot 'api.stdout.log'
    $apiStderr = Join-Path $runtimeRoot 'api.stderr.log'
    # WSL does not import arbitrary Windows environment variables unless they
    # are listed in WSLENV. Pass only the runtime names the API understands;
    # values (including credentials) stay in the child process environment and
    # never enter the command line, runtime receipt, or log files.
    $apiEnvironmentNames = @(
        'J2K26_AI_PROVIDER',
        'J2K26_AI_BASE_URL',
        'J2K26_AI_MODEL',
        'J2K26_AI_AUTH_MODE',
        'J2K26_AI_API_KEY',
        'MOONSHOT_API_KEY',
        'J2K26_PRIVATE_PROFILE_PATH',
        'RUST_LOG'
    )
    $previousWslEnv = $env:WSLENV
    $wslEnvEntries = @()
    if (-not [string]::IsNullOrWhiteSpace($previousWslEnv)) {
        $wslEnvEntries += $previousWslEnv.Split(':', [StringSplitOptions]::RemoveEmptyEntries)
    }
    foreach ($name in $apiEnvironmentNames) {
        if (Test-Path -LiteralPath "Env:$name") {
            $alreadyIncluded = $wslEnvEntries | Where-Object {
                $_.Split('/')[0] -eq $name
            }
            if (-not $alreadyIncluded) {
                $wslEnvEntries += $name
            }
        }
    }

    try {
        if ($wslEnvEntries.Count -gt 0) {
            $env:WSLENV = $wslEnvEntries -join ':'
        }
        $apiProcess = Start-Process -FilePath 'wsl.exe' `
            -ArgumentList @('-d', 'Ubuntu', '--', 'bash', '-lc', "cd '$wslRoot' && bash scripts/run-api-dev.sh") `
            -RedirectStandardOutput $apiStdout `
            -RedirectStandardError $apiStderr `
            -WindowStyle Hidden `
            -PassThru
    }
    finally {
        if ($null -eq $previousWslEnv) {
            Remove-Item Env:WSLENV -ErrorAction SilentlyContinue
        }
        else {
            $env:WSLENV = $previousWslEnv
        }
    }

    $apiReady = $false
    for ($attempt = 0; $attempt -lt 120; $attempt++) {
        if (Test-Url -Url 'http://127.0.0.1:3000/api/v1/health') {
            $apiReady = $true
            break
        }
        if ($apiProcess.HasExited) {
            throw "University2K26 API exited before readiness. See $apiStderr"
        }
        Start-Sleep -Milliseconds 500
    }
    if (-not $apiReady) {
        throw "University2K26 API did not become ready. See $apiStderr"
    }
}

$webProcess = $null
if (-not (Test-Url -Url 'http://127.0.0.1:4173/')) {
    if (-not (Test-Path -LiteralPath $viteEntry)) {
        throw 'Web dependencies are missing. Run scripts/bootstrap.ps1 first.'
    }
    $webStdout = Join-Path $runtimeRoot 'web.stdout.log'
    $webStderr = Join-Path $runtimeRoot 'web.stderr.log'
    $webProcess = Start-Process -FilePath $nodeExe `
        -ArgumentList @($viteEntry, '--host', '127.0.0.1', '--port', '4173', '--strictPort') `
        -WorkingDirectory $webRoot `
        -RedirectStandardOutput $webStdout `
        -RedirectStandardError $webStderr `
        -WindowStyle Hidden `
        -PassThru

    $webReady = $false
    for ($attempt = 0; $attempt -lt 60; $attempt++) {
        if (Test-Url -Url 'http://127.0.0.1:4173/') {
            $webReady = $true
            break
        }
        if ($webProcess.HasExited) {
            throw "University2K26 Web exited before readiness. See $webStderr"
        }
        Start-Sleep -Milliseconds 250
    }
    if (-not $webReady) {
        throw "University2K26 Web did not become ready. See $webStderr"
    }
}

[ordered]@{
    schema_version = '1.0.0'
    started_at = (Get-Date).ToString('o')
    api_pid = if ($apiProcess) { $apiProcess.Id } else { $null }
    web_pid = if ($webProcess) { $webProcess.Id } else { $null }
    api_url = 'http://127.0.0.1:3000/api/v1/health'
    web_url = 'http://127.0.0.1:4173/'
    data_mode = if ($FixtureOnly) { 'fixture-only' } else { 'api-with-fixture-fallback' }
    logical_root = $logicalRoot
    physical_build_root = $physicalRoot
} | ConvertTo-Json | Set-Content -LiteralPath $runtimeFile -Encoding utf8

$modeLabel = if ($FixtureOnly) { 'Fixture-only Web demo' } else { 'API + Web' }
Write-Host "University2K26 V0.9 ($modeLabel) is ready at http://127.0.0.1:4173/" -ForegroundColor Green
if (-not $NoOpen) {
    Start-Process 'http://127.0.0.1:4173/'
}
