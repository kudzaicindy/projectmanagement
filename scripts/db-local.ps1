# Windows helper: prompts for postgres password, then npm run db:local
$ErrorActionPreference = "Stop"
Set-Location (Split-Path -Parent $PSScriptRoot)

if (-not $env:POSTGRES_ADMIN_URL) {
  Write-Host ""
  Write-Host "EstatePM local database setup (PostgreSQL on port 5432)" -ForegroundColor Cyan
  Write-Host "Enter the password you chose when installing PostgreSQL (user: postgres)."
  $secure = Read-Host "postgres password" -AsSecureString
  $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  try {
    $plain = [Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
  } finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
  }
  $encoded = [uri]::EscapeDataString($plain)
  $env:POSTGRES_ADMIN_URL = "postgresql://postgres:${encoded}@127.0.0.1:5432/postgres"
}

node scripts/init-local-db.mjs
