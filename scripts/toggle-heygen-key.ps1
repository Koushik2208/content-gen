# PowerShell script to toggle HeyGen API key
# Usage: 
#   .\scripts\toggle-heygen-key.ps1 enable  - Enable the key
#   .\scripts\toggle-heygen-key.ps1 disable - Disable the key

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("enable", "disable")]
    [string]$Action
)

$envFile = ".env.local"
$backupFile = ".env.local.backup"

if (-not (Test-Path $envFile)) {
    Write-Host "Error: .env.local file not found!" -ForegroundColor Red
    exit 1
}

# Create backup on first disable
if ($Action -eq "disable" -and -not (Test-Path $backupFile)) {
    Copy-Item $envFile $backupFile
    Write-Host "Created backup: $backupFile" -ForegroundColor Yellow
}

$content = Get-Content $envFile -Raw

if ($Action -eq "disable") {
    # Comment out HEYGEN_API_KEY line
    $content = $content -replace '^HEYGEN_API_KEY=', '# HEYGEN_API_KEY='
    Write-Host "HeyGen API key has been DISABLED (commented out)" -ForegroundColor Red
    Write-Host "Your key is safe in: $backupFile" -ForegroundColor Yellow
} else {
    # Restore from backup if exists, or uncomment the line
    if (Test-Path $backupFile) {
        $backupContent = Get-Content $backupFile -Raw
        $keyLine = ($backupContent -split "`n" | Where-Object { $_ -match '^HEYGEN_API_KEY=' })
        if ($keyLine) {
            # Replace commented line with original
            $content = $content -replace '# HEYGEN_API_KEY=.*', $keyLine.Trim()
            Write-Host "HeyGen API key has been ENABLED (restored from backup)" -ForegroundColor Green
        } else {
            # Just uncomment if no backup
            $content = $content -replace '^# HEYGEN_API_KEY=', 'HEYGEN_API_KEY='
            Write-Host "HeyGen API key has been ENABLED (uncommented)" -ForegroundColor Green
        }
    } else {
        # Just uncomment the line
        $content = $content -replace '^# HEYGEN_API_KEY=', 'HEYGEN_API_KEY='
        Write-Host "HeyGen API key has been ENABLED (uncommented)" -ForegroundColor Green
    }
}

Set-Content -Path $envFile -Value $content -NoNewline
Write-Host "Updated $envFile" -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANT: Restart your Next.js dev server for changes to take effect!" -ForegroundColor Yellow

