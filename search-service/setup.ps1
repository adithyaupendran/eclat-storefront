# PowerShell setup script for ÉCLAT Search Service
# Run from the search-service/ directory:
#   .\setup.ps1

param(
    [switch]$SkipSeed   # pass -SkipSeed to skip ChromaDB seeding
)

$ErrorActionPreference = "Stop"
$serviceDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host ""
Write-Host "⚡ ÉCLAT Vector Search — Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# ── 1. Check Python ───────────────────────────────────────────────────────────
Write-Host "1. Checking Python..." -ForegroundColor Yellow
$pyVersion = python --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ❌ Python not found. Install Python 3.10+ from https://python.org" -ForegroundColor Red
    exit 1
}
Write-Host "   ✅ $pyVersion" -ForegroundColor Green

# ── 2. Create venv ────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "2. Creating virtual environment..." -ForegroundColor Yellow
$venvPath = Join-Path $serviceDir ".venv"
if (Test-Path $venvPath) {
    Write-Host "   ℹ️  .venv already exists — skipping creation"
} else {
    python -m venv .venv
    Write-Host "   ✅ Created .venv"
}

# ── 3. Activate venv ─────────────────────────────────────────────────────────
Write-Host ""
Write-Host "3. Activating venv..." -ForegroundColor Yellow
& "$venvPath\Scripts\Activate.ps1"
Write-Host "   ✅ Activated"

# ── 4. Install dependencies ───────────────────────────────────────────────────
Write-Host ""
Write-Host "4. Installing dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt --quiet
Write-Host "   ✅ Dependencies installed"

# ── 5. Create .env from example ───────────────────────────────────────────────
Write-Host ""
Write-Host "5. Setting up .env..." -ForegroundColor Yellow
$envPath = Join-Path $serviceDir ".env"
$envExamplePath = Join-Path $serviceDir ".env.example"
if (Test-Path $envPath) {
    Write-Host "   ℹ️  .env already exists — skipping"
} else {
    Copy-Item $envExamplePath $envPath
    Write-Host "   ✅ Created .env from .env.example"
    Write-Host "   ⚠️  Edit .env to add your SUPABASE_SERVICE_ROLE_KEY if needed" -ForegroundColor Yellow
}

# ── 6. Seed ChromaDB ──────────────────────────────────────────────────────────
if (-not $SkipSeed) {
    Write-Host ""
    Write-Host "6. Seeding ChromaDB (this downloads ~90MB model on first run)..." -ForegroundColor Yellow
    python scripts/seed_chroma.py --source catalog --wipe
    Write-Host "   ✅ ChromaDB seeded"
} else {
    Write-Host ""
    Write-Host "6. Skipping ChromaDB seed (--SkipSeed passed)" -ForegroundColor DarkGray
}

# ── Done ──────────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Start the service:" -ForegroundColor White
Write-Host "   .\.venv\Scripts\Activate.ps1" -ForegroundColor DarkCyan
Write-Host "   python -m uvicorn main:app --reload --port 8000" -ForegroundColor DarkCyan
Write-Host ""
Write-Host "Then update storefront/.env.local:" -ForegroundColor White
Write-Host "   VECTOR_SEARCH_URL=http://localhost:8000" -ForegroundColor DarkCyan
Write-Host "   VECTOR_SEARCH_SECRET=eclat_search_secret_2026" -ForegroundColor DarkCyan
Write-Host ""
