# F1 Race Control - Database Setup Script
# This script will properly set up your Prisma database

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "F1 Race Control - Database Setup" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if .env exists
if (-Not (Test-Path "..\\.env")) {
    Write-Host "ERROR: .env file not found!" -ForegroundColor Red
    Write-Host "Please copy .env.example to .env and configure your database credentials." -ForegroundColor Yellow
    exit 1
}

Write-Host "[1/5] Checking database connection..." -ForegroundColor Yellow
npx prisma db execute --stdin --schema=../prisma/schema.prisma <<< "SELECT 1;" 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Cannot connect to database. Please check your DATABASE_URL in .env" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Database connection successful" -ForegroundColor Green
Write-Host ""

# Step 2: Check migration status
Write-Host "[2/5] Checking migration status..." -ForegroundColor Yellow
npx prisma migrate status --schema=../prisma/schema.prisma
Write-Host ""

# Step 3: Apply migrations (if needed)
Write-Host "[3/5] Applying migrations..." -ForegroundColor Yellow
npx prisma migrate deploy --schema=../prisma/schema.prisma
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Migration failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Migrations applied successfully" -ForegroundColor Green
Write-Host ""

# Step 4: Generate Prisma Client
Write-Host "[4/5] Generating Prisma Client..." -ForegroundColor Yellow
Write-Host "Note: If this fails, please stop any running servers first." -ForegroundColor Gray
npx prisma generate --schema=../prisma/schema.prisma
if ($LASTEXITCODE -ne 0) {
    Write-Host "WARNING: Prisma Client generation failed. Try stopping the server and running again." -ForegroundColor Yellow
} else {
    Write-Host "✓ Prisma Client generated successfully" -ForegroundColor Green
}
Write-Host ""

# Step 5: Seed database
Write-Host "[5/5] Seeding database..." -ForegroundColor Yellow
$seedChoice = Read-Host "Do you want to seed the database with sample data? (y/n)"
if ($seedChoice -eq "y" -or $seedChoice -eq "Y") {
    npm run seed
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Database seeded successfully" -ForegroundColor Green
    } else {
        Write-Host "WARNING: Seeding failed. You can run 'npm run seed' manually later." -ForegroundColor Yellow
    }
} else {
    Write-Host "Skipping seed..." -ForegroundColor Gray
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "You can now start the server with: npm run dev" -ForegroundColor Cyan
