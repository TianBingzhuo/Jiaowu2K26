[CmdletBinding()]
param(
    [ValidateSet('Open', 'Setup', 'Update', 'Doctor', 'Stop')]
    [string]$Action = 'Open',
    [switch]$Pull
)

$ErrorActionPreference = 'Stop'
$env:ASTRO_TELEMETRY_DISABLED = '1'

function Get-PhysicalToolingRoot {
    param([Parameter(Mandatory)][string]$LogicalRoot)

    $logicalFull = [IO.Path]::GetFullPath($LogicalRoot)
    try {
        $cursor = Get-Item -LiteralPath $logicalFull -Force
        while ($cursor) {
            if (($cursor.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) {
                $target = [string]$cursor.Target
                $targetRoot = $null
                if ($target -match '^Volume\{[0-9A-Fa-f-]+\}\\$') {
                    $deviceId = "\\?\$target"
                    $volume = Get-CimInstance Win32_Volume -ErrorAction Stop |
                        Where-Object DeviceID -eq $deviceId |
                        Select-Object -First 1
                    if ($volume.DriveLetter) { $targetRoot = "$($volume.DriveLetter)\" }
                }
                elseif ([IO.Path]::IsPathRooted($target)) {
                    $targetRoot = $target
                }

                if ($targetRoot) {
                    $suffix = [IO.Path]::GetRelativePath($cursor.FullName, $logicalFull)
                    $candidate = if ($suffix -eq '.') {
                        [IO.Path]::GetFullPath($targetRoot)
                    }
                    else {
                        [IO.Path]::GetFullPath((Join-Path $targetRoot $suffix))
                    }
                    $logicalScript = Join-Path $logicalFull 'tools\Docs.ps1'
                    $candidateScript = Join-Path $candidate 'tools\Docs.ps1'
                    if ((Test-Path -LiteralPath $candidateScript) -and
                        ((Get-FileHash -LiteralPath $logicalScript -Algorithm SHA256).Hash -eq
                         (Get-FileHash -LiteralPath $candidateScript -Algorithm SHA256).Hash)) {
                        return $candidate
                    }
                }
            }
            $cursor = $cursor.Parent
        }
    }
    catch {
        # A normal clone has no reparse-point translation and safely uses the logical path.
    }
    return $logicalFull
}

$ProjectRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$ToolingRoot = Get-PhysicalToolingRoot -LogicalRoot $ProjectRoot
$DocsRoot = Join-Path $ToolingRoot 'docs-site'
$PinnedNodeVersion = (Get-Content -Raw (Join-Path $ToolingRoot '.node-version')).Trim()
$LocalNodeRoot = Join-Path $ToolingRoot ".tools\node-v$PinnedNodeVersion-win-x64"
$LocalNode = Join-Path $LocalNodeRoot 'node.exe'
$LocalNpm = Join-Path $LocalNodeRoot 'npm.cmd'
$env:J2K26_CANONICAL_ROOT = $ProjectRoot
$RuntimeRoot = Join-Path $DocsRoot '.runtime'
$LogsRoot = Join-Path $DocsRoot '.logs'
$PidFile = Join-Path $RuntimeRoot 'preview.pid'
$LockHashFile = Join-Path $RuntimeRoot 'package-lock.sha256'
$PortalUrl = 'http://127.0.0.1:4321/'

function Write-Stage([string]$Message) {
    Write-Host "`n[J2K26] $Message" -ForegroundColor Cyan
}

function Write-GentleWarning([string]$Message) {
    Write-Host "[J2K26] $Message" -ForegroundColor Yellow
}

function Invoke-Checked {
    param(
        [Parameter(Mandatory)][string]$FilePath,
        [Parameter()][string[]]$Arguments = @(),
        [Parameter()][string]$WorkingDirectory = $ToolingRoot
    )
    Push-Location $WorkingDirectory
    try {
        & $FilePath @Arguments
        if ($LASTEXITCODE -ne 0) {
            throw "命令执行失败（退出码 $LASTEXITCODE）：$FilePath $($Arguments -join ' ')"
        }
    }
    finally {
        Pop-Location
    }
}

function Get-RequiredCommand([string]$Name) {
    $command = Get-Command $Name -ErrorAction SilentlyContinue
    if (-not $command) {
        throw "没有找到 $Name。请先阅读 docs\GETTING-STARTED.md 完成基础环境配置。"
    }
    return $command.Source
}

function Get-NpmRuntime {
    if (Test-Path -LiteralPath $LocalNpm) {
        return $LocalNpm
    }
    return Get-RequiredCommand 'npm.cmd'
}

function Test-NodeRuntime {
    $node = if (Test-Path -LiteralPath $LocalNode) {
        $LocalNode
    }
    else {
        Get-RequiredCommand 'node'
    }
    $raw = (& $node --version).Trim().TrimStart('v')
    $version = [version]$raw
    if ($raw -ne $PinnedNodeVersion) {
        throw "当前 Node.js 为 v$raw；项目已锁定 v$PinnedNodeVersion。请先运行 scripts\bootstrap.ps1。"
    }
    return @{ Path = $node; Version = $version }
}

function Invoke-SafeGitPull {
    $git = Get-Command git -ErrorAction SilentlyContinue
    if (-not $git) {
        Write-GentleWarning '未安装 Git，跳过云端更新；本地文档仍可打开。'
        return
    }
    if (-not (Test-Path -LiteralPath (Join-Path $ToolingRoot '.git'))) {
        Write-GentleWarning '当前目录尚不是 Git 克隆仓，跳过云端更新；从 GitHub 克隆后会自动启用。'
        return
    }

    $changes = @(& $git.Source -C $ToolingRoot status --porcelain)
    if ($LASTEXITCODE -ne 0) {
        Write-GentleWarning '无法读取 Git 状态，跳过云端更新。'
        return
    }
    if ($changes.Count -gt 0) {
        Write-GentleWarning '检测到未提交改动，为保护同学的工作已跳过 git pull。请先提交、暂存或另行处理。'
        return
    }

    & $git.Source -C $ToolingRoot rev-parse --abbrev-ref --symbolic-full-name '@{u}' *> $null
    if ($LASTEXITCODE -ne 0) {
        Write-GentleWarning '当前分支没有配置上游远端，跳过云端更新。'
        return
    }

    Write-Stage '以 fast-forward-only 模式拉取云端最新内容'
    & $git.Source -C $ToolingRoot pull --ff-only
    if ($LASTEXITCODE -ne 0) {
        throw 'git pull --ff-only 未成功；未执行自动合并或变基，请人工检查后重试。'
    }
}

function Ensure-Dependencies {
    $null = Test-NodeRuntime
    $npm = Get-NpmRuntime
    $packageLock = Join-Path $DocsRoot 'package-lock.json'
    $nodeModules = Join-Path $DocsRoot 'node_modules'
    $needInstall = -not (Test-Path -LiteralPath $nodeModules)

    if (Test-Path -LiteralPath $packageLock) {
        $currentHash = (Get-FileHash -LiteralPath $packageLock -Algorithm SHA256).Hash
        $knownHash = if (Test-Path -LiteralPath $LockHashFile) {
            (Get-Content -LiteralPath $LockHashFile -Raw).Trim()
        } else { '' }
        if ($currentHash -ne $knownHash) { $needInstall = $true }
    }

    if (-not $needInstall) {
        Write-Host '[J2K26] 依赖已经就绪。' -ForegroundColor DarkGreen
        return
    }

    Write-Stage '安装锁定的文档门户依赖（首次运行可能需要几分钟）'
    if (Test-Path -LiteralPath $packageLock) {
        Invoke-Checked -FilePath $npm -Arguments @('ci', '--no-audit', '--no-fund') -WorkingDirectory $DocsRoot
    }
    else {
        Invoke-Checked -FilePath $npm -Arguments @('install', '--no-audit', '--no-fund') -WorkingDirectory $DocsRoot
    }

    if (Test-Path -LiteralPath $packageLock) {
        New-Item -ItemType Directory -Path $RuntimeRoot -Force | Out-Null
        (Get-FileHash -LiteralPath $packageLock -Algorithm SHA256).Hash |
            Set-Content -LiteralPath $LockHashFile -Encoding ascii
    }
}

function Build-Portal {
    $npm = Get-NpmRuntime
    if ($ToolingRoot -ne $ProjectRoot) {
        Write-Host "[J2K26] 检测到 junction：稳定入口保留 $ProjectRoot；Astro 本轮统一使用等效物理路径 $ToolingRoot。" -ForegroundColor DarkGray
        foreach ($relative in @('.astro', 'node_modules\.vite')) {
            $cache = [IO.Path]::GetFullPath((Join-Path $DocsRoot $relative))
            $docsPrefix = $DocsRoot.TrimEnd('\') + '\'
            if (-not $cache.StartsWith($docsPrefix, [StringComparison]::OrdinalIgnoreCase)) {
                throw "拒绝清理文档目录之外的缓存：$cache"
            }
            if (Test-Path -LiteralPath $cache) {
                Remove-Item -LiteralPath $cache -Recurse -Force
            }
        }
    }
    Write-Stage '同步规范源并构建离线全文搜索索引'
    Invoke-Checked -FilePath $npm -Arguments @('run', 'build') -WorkingDirectory $DocsRoot
}

function Test-PortalServer {
    try {
        $response = Invoke-WebRequest -Uri $PortalUrl -UseBasicParsing -TimeoutSec 1
        return $response.StatusCode -ge 200 -and $response.StatusCode -lt 500
    }
    catch {
        return $false
    }
}

function Start-PortalServer {
    if (Test-PortalServer) {
        Write-Host '[J2K26] 文档服务器已经运行。' -ForegroundColor DarkGreen
        return
    }

    $nodeInfo = Test-NodeRuntime
    $astroCli = Join-Path $DocsRoot 'node_modules\astro\bin\astro.mjs'
    if (-not (Test-Path -LiteralPath $astroCli)) {
        throw 'Astro CLI 不存在，请重新执行 Setup。'
    }

    New-Item -ItemType Directory -Path $RuntimeRoot -Force | Out-Null
    New-Item -ItemType Directory -Path $LogsRoot -Force | Out-Null
    $stdout = Join-Path $LogsRoot 'preview.stdout.log'
    $stderr = Join-Path $LogsRoot 'preview.stderr.log'
    $arguments = @($astroCli, 'preview', '--host', '127.0.0.1', '--port', '4321')

    Write-Stage '启动本地文档服务器'
    $process = Start-Process -FilePath $nodeInfo.Path -ArgumentList $arguments `
        -WorkingDirectory $DocsRoot -WindowStyle Hidden -PassThru `
        -RedirectStandardOutput $stdout -RedirectStandardError $stderr
    $process.Id | Set-Content -LiteralPath $PidFile -Encoding ascii

    for ($attempt = 0; $attempt -lt 40; $attempt += 1) {
        if (Test-PortalServer) { return }
        Start-Sleep -Milliseconds 250
    }
    throw "文档服务器没有按时启动，请查看 $stderr"
}

function Stop-PortalServer {
    if (-not (Test-Path -LiteralPath $PidFile)) {
        Write-GentleWarning '没有找到由本项目记录的文档服务器进程。'
        return
    }
    $processId = [int](Get-Content -LiteralPath $PidFile -Raw).Trim()
    $processInfo = Get-CimInstance Win32_Process -Filter "ProcessId = $processId" -ErrorAction SilentlyContinue
    if (-not $processInfo) {
        Remove-Item -LiteralPath $PidFile -Force
        Write-GentleWarning '记录的服务器进程已经结束。'
        return
    }
    if ($processInfo.CommandLine -notlike "*$DocsRoot*" -or $processInfo.CommandLine -notlike '*astro*preview*') {
        throw 'PID 已被其他程序占用，为安全起见没有终止该进程。'
    }
    Stop-Process -Id $processId
    Remove-Item -LiteralPath $PidFile -Force
    Write-Host '[J2K26] 文档服务器已关闭。' -ForegroundColor DarkGreen
}

function New-DesktopShortcut {
    $desktop = [Environment]::GetFolderPath('Desktop')
    if (-not $desktop) { throw '无法确定当前用户桌面路径。' }
    $shell = New-Object -ComObject WScript.Shell
    $shortcutPath = Join-Path $desktop 'Jiaowu2K26 文档中心.lnk'
    $shortcut = $shell.CreateShortcut($shortcutPath)
    $hostCommand = Get-Command pwsh -ErrorAction SilentlyContinue
    if (-not $hostCommand) { $hostCommand = Get-Command powershell -ErrorAction Stop }
    $shortcut.TargetPath = $hostCommand.Source
    $shortcut.Arguments = "-NoLogo -NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`" -Action Open -Pull"
    $shortcut.WorkingDirectory = $ProjectRoot
    $shortcut.Description = '安全拉取最新内容并打开 Jiaowu2K26 本地文档门户'
    $shortcut.IconLocation = "$env:SystemRoot\System32\shell32.dll,220"
    $shortcut.WindowStyle = 7
    $shortcut.Save()
    Write-Host "[J2K26] 已创建桌面快捷方式：$shortcutPath" -ForegroundColor DarkGreen
}

function Show-Doctor {
    Write-Stage '环境自检'
    Write-Host "项目根目录：$ProjectRoot"
    if ($ToolingRoot -ne $ProjectRoot) {
        Write-Host "构建物理路径：$ToolingRoot（仅用于规避 junction 构建器兼容问题）"
    }
    Write-Host "文档目录：$DocsRoot"
    $node = if (Test-Path -LiteralPath $LocalNode) { $LocalNode } else { (Get-Command node -ErrorAction SilentlyContinue).Source }
    $npm = if (Test-Path -LiteralPath $LocalNpm) { $LocalNpm } else { (Get-Command npm.cmd -ErrorAction SilentlyContinue).Source }
    $git = Get-Command git -ErrorAction SilentlyContinue
    Write-Host "Node.js：$(if ($node) { & $node --version } else { '未安装' })"
    Write-Host "npm：$(if ($npm) { & $npm --version } else { '未安装' })"
    Write-Host "Git：$(if ($git) { & $git.Source --version } else { '未安装' })"
    Write-Host "Git 仓库：$(if (Test-Path (Join-Path $ToolingRoot '.git')) { '是' } else { '否（当前会安全跳过拉取）' })"
    Write-Host "依赖目录：$(if (Test-Path (Join-Path $DocsRoot 'node_modules')) { '已存在' } else { '未安装' })"
    Write-Host "构建产物：$(if (Test-Path (Join-Path $DocsRoot 'dist\index.html')) { '已存在' } else { '尚未构建' })"
    Write-Host "文档服务器：$(if (Test-PortalServer) { '正在运行' } else { '未运行' })"
}

try {
    switch ($Action) {
        'Doctor' {
            Show-Doctor
        }
        'Stop' {
            Stop-PortalServer
        }
        'Setup' {
            Ensure-Dependencies
            Build-Portal
            New-DesktopShortcut
            Show-Doctor
        }
        'Update' {
            Invoke-SafeGitPull
            Ensure-Dependencies
            Build-Portal
        }
        'Open' {
            if ($Pull) { Invoke-SafeGitPull }
            Ensure-Dependencies
            Build-Portal
            Start-PortalServer
            Write-Stage "在默认浏览器打开 $PortalUrl"
            Start-Process $PortalUrl
        }
    }
}
catch {
    Write-Host "`n[J2K26] 没能完成：$($_.Exception.Message)" -ForegroundColor Red
    Write-Host '[J2K26] 可以运行 tools\Docs.ps1 -Action Doctor 查看环境状态。' -ForegroundColor Yellow
    exit 1
}
