# F1 Race Control - Database Reset Script
# WARNING: This will delete all data and reset your database!

Write-Host "==================================" -ForegroundColor Red
Write-Host "DATABASE RESET - WARNING!" -ForegroundColor Red
Write-Host "==================================" -ForegroundColor Red
Write-Host ""
Write-Host "This will DELETE ALL DATA in your database!" -ForegroundColor Yellow
Write-Host ""

$confirmation = Read-Host "Are you sure you want to continue? Type 'YES' to confirm"

if ($confirmation -ne "YES") {
    Write-Host "Reset cancelled." -ForegroundColor Green
    exit 0
}

Write-Host ""
Write-Host "Resetting database..." -ForegroundColor Yellow

# Reset the database
npx prisma migrate reset --schema=../prisma/schema.prisma --force

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ Database reset complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "The database has been reset and seeded with fresh data." -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "ERROR: Database reset failed!" -ForegroundColor Red
    exit 1
}
