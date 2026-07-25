Set-StrictMode -Version Latest

function Get-J2K26PhysicalRoot {
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
                    if (Test-Path -LiteralPath (Join-Path $candidate 'PROJECT-MANIFEST.json')) {
                        return $candidate
                    }
                }
            }
            $cursor = $cursor.Parent
        }
    }
    catch {
        # A normal clone has no reparse-point translation and safely uses its logical path.
    }
    return $logicalFull
}

function Get-J2K26SmartAppControlState {
    $value = (Get-ItemProperty -Path 'HKLM:\SYSTEM\CurrentControlSet\Control\CI\Policy' -Name VerifiedAndReputablePolicyState -ErrorAction SilentlyContinue).VerifiedAndReputablePolicyState
    switch ($value) {
        0 { return 'off' }
        1 { return 'enforce' }
        2 { return 'evaluation' }
        default { return 'unknown' }
    }
}

function Test-J2K26UbuntuWsl {
    $wsl = Get-Command wsl.exe -ErrorAction SilentlyContinue
    if (-not $wsl) { return $false }
    & $wsl.Source -d Ubuntu -- bash -lc 'true' *> $null
    return $LASTEXITCODE -eq 0
}
