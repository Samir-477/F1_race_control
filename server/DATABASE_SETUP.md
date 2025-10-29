# F1 Race Control - Database Setup Guide

## Prerequisites

1. **MySQL Database** - Make sure you have MySQL installed and running
2. **Database Created** - Create a database named `race_control` (or your preferred name)
3. **Environment Variables** - Configure your `.env` file

## Initial Setup

### 1. Configure Environment Variables

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` and update with your database credentials:
```
DATABASE_URL="mysql://username:password@localhost:3306/race_control"
JWT_SECRET="your_secure_jwt_secret_here"
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Complete Setup (Recommended for first time)

This will generate Prisma Client, apply migrations, and seed the database:
```bash
npm run setup
```

## Database Commands

### Check Migration Status
```bash
npm run db:status
```

### Apply Migrations (Production)
```bash
npm run db:migrate
```

### Create New Migration (Development)
```bash
npm run db:migrate:dev
```

### Generate Prisma Client
```bash
npm run generate
```

### Seed Database
```bash
npm run seed
```

### Reset Database (WARNING: Deletes all data!)
```bash
npm run db:reset
```

### Open Prisma Studio (Database GUI)
```bash
npm run db:studio
```

## Common Issues & Solutions

### Issue: "EPERM: operation not permitted" when generating Prisma Client

**Solution:** Stop the development server before running `npm run generate`

### Issue: "Can't reach database server"

**Solutions:**
1. Check if MySQL is running
2. Verify DATABASE_URL in `.env` is correct
3. Ensure the database exists: `CREATE DATABASE race_control;`
4. Check firewall settings

### Issue: Migration conflicts

**Solution:** Reset and reapply migrations:
```bash
npm run db:reset
```

## Database Schema Overview

The database includes the following main models:

- **User** - Admin and Steward users
- **Team** - F1 teams
- **Driver** - F1 drivers
- **Car** - Team cars
- **Sponsor** - Team sponsors
- **Circuit** - Race circuits
- **Season** - Racing seasons
- **Race** - Individual races
- **RaceResult** - Race results
- **RaceIncident** - Race incidents
- **Penalty** - Penalties
- **PenaltyAssignment** - Steward penalty assignments
- **RaceLog** - Race monitoring logs

## Default Seed Data

After seeding, you'll have:

**Users:**
- Admin: `admin@f1control.com` / `admin123`
- Steward 1: `steward1` / `steward123`
- Steward 2: `steward2` / `steward123`

**Circuits:** 10 famous F1 circuits
**Seasons:** 2023, 2024 (active), 2025

## Migration Workflow

### Creating a New Migration

1. Modify `prisma/schema.prisma`
2. Run: `npm run db:migrate:dev`
3. Give the migration a descriptive name
4. Prisma will generate SQL and apply it

### Applying Migrations in Production

```bash
npm run db:migrate
```

## Prisma Studio

To visually inspect and edit your database:
```bash
npm run db:studio
```

This opens a web interface at `http://localhost:5555`

## Troubleshooting

### Reset Everything (Fresh Start)

```bash
# 1. Stop the server
# 2. Reset database
npm run db:reset

# 3. Generate client
npm run generate

# 4. Seed database
npm run seed
```

### Manual Database Reset

If automated reset fails:
```sql
DROP DATABASE race_control;
CREATE DATABASE race_control;
```

Then run:
```bash
npm run setup
```

## Best Practices

1. **Always backup** before running `db:reset`
2. **Never commit** `.env` file to git
3. **Use migrations** instead of `db:push` in production
4. **Test migrations** in development before production
5. **Keep schema.prisma** in sync with your database

## Need Help?

- Check Prisma docs: https://www.prisma.io/docs
- View migration files in `prisma/migrations/`
- Check server logs for detailed error messages
