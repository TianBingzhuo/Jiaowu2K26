Set-StrictMode -Version Latest

function Get-J2K26AiCredentialPaths {
    param([Parameter(Mandatory)][string]$PhysicalRoot)

    $directory = Join-Path $PhysicalRoot '.data\university2k26-v09\credentials'
    [pscustomobject]@{
        Directory = $directory
        Configuration = Join-Path $directory 'ai-runtime.json'
        Secret = Join-Path $directory 'moonshot-api-key.dpapi'
    }
}

function Import-J2K26AiRuntimeCredential {
    [CmdletBinding()]
    param([Parameter(Mandatory)][string]$PhysicalRoot)

    $paths = Get-J2K26AiCredentialPaths -PhysicalRoot $PhysicalRoot
    if (-not (Test-Path -LiteralPath $paths.Configuration) -or
        -not (Test-Path -LiteralPath $paths.Secret)) {
        return [pscustomobject]@{
            Loaded = $false
            Provider = $null
            Model = $null
            Thinking = $null
            ImportedNames = @()
        }
    }

    if (-not $IsWindows) {
        throw 'The checked-in local BYOK store uses Windows DPAPI and can only be decrypted by the Windows user who configured it.'
    }

    $configuration = Get-Content -LiteralPath $paths.Configuration -Raw |
        ConvertFrom-Json
    if ($configuration.schema_version -ne '1.0.0' -or
        $configuration.provider -ne 'moonshot' -or
        $configuration.base_url -ne 'https://api.moonshot.cn/v1' -or
        $configuration.auth_mode -ne 'bearer' -or
        $configuration.model -notmatch '^kimi-[A-Za-z0-9._-]+$' -or
        $configuration.thinking -notin @('enabled', 'disabled')) {
        throw 'The saved AI runtime configuration is invalid. Run scripts/Configure-University2K26-AI.ps1 again.'
    }

    $importedNames = [Collections.Generic.List[string]]::new()
    $nonSecretValues = [ordered]@{
        J2K26_AI_PROVIDER = [string]$configuration.provider
        J2K26_AI_BASE_URL = [string]$configuration.base_url
        J2K26_AI_MODEL = [string]$configuration.model
        J2K26_AI_AUTH_MODE = [string]$configuration.auth_mode
        J2K26_AI_THINKING = [string]$configuration.thinking
    }
    foreach ($entry in $nonSecretValues.GetEnumerator()) {
        if (-not (Test-Path -LiteralPath "Env:$($entry.Key)")) {
            Set-Item -LiteralPath "Env:$($entry.Key)" -Value $entry.Value
            $importedNames.Add($entry.Key)
        }
    }

    if (-not (Test-Path Env:J2K26_AI_API_KEY) -and
        -not (Test-Path Env:MOONSHOT_API_KEY)) {
        $encrypted = (Get-Content -LiteralPath $paths.Secret -Raw).Trim()
        if ([string]::IsNullOrWhiteSpace($encrypted)) {
            throw 'The saved AI credential is empty. Run scripts/Configure-University2K26-AI.ps1 again.'
        }
        $secure = ConvertTo-SecureString -String $encrypted
        $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
        try {
            $plainText = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
            Set-Item -LiteralPath Env:MOONSHOT_API_KEY -Value $plainText
            $importedNames.Add('MOONSHOT_API_KEY')
        }
        finally {
            if ($pointer -ne [IntPtr]::Zero) {
                [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
            }
            $plainText = $null
            $secure.Dispose()
        }
    }

    [pscustomobject]@{
        Loaded = $true
        Provider = [string]$configuration.provider
        Model = [string]$configuration.model
        Thinking = [string]$configuration.thinking
        ImportedNames = $importedNames.ToArray()
    }
}

function Restore-J2K26AiRuntimeEnvironment {
    [CmdletBinding()]
    param([Parameter(Mandatory)]$State)

    foreach ($name in $State.ImportedNames) {
        Remove-Item -LiteralPath "Env:$name" -ErrorAction SilentlyContinue
    }
}
