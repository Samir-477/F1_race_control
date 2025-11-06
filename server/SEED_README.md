# 🌱 Seed Data Files

Your database has been exported to seed files that you can use to restore your data.

## 📁 Generated Files

### 1. **`seed-data.json`**
- **Format:** JSON
- **Contains:** All your database data in JSON format
- **Use for:** Backup, inspection, or programmatic import

### 2. **`SEED_DATA.sql`**
- **Format:** SQL
- **Contains:** SQL INSERT statements for all your data
- **Use for:** Quick restore in MySQL Workbench

---

## 📊 Data Summary

Your database contains:
- ✅ **3 Seasons**
- ✅ **5 Teams**
- ✅ **10 Drivers**
- ✅ **10 Circuits**
- ✅ **5 Races**
- ✅ **42 Race Results**
- ✅ **14 Race Incidents**
- ✅ **13 Penalties**
- ✅ **3 Users** (passwords excluded for security)

---

## 🚀 How to Restore Data

### Option 1: Using SQL File (Recommended)

1. **Open MySQL Workbench**
2. **Connect to your database**
3. **Open `SEED_DATA.sql`** file
4. **Execute the entire script** (Ctrl+Shift+Enter)
5. **Done!** All your data is restored

### Option 2: Using JSON File with Prisma

```javascript
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();
const seedData = JSON.parse(fs.readFileSync('seed-data.json', 'utf8'));

// Import seasons
for (const season of seedData.seasons) {
  await prisma.season.create({ data: season });
}

// Import teams
for (const team of seedData.teams) {
  await prisma.team.create({ data: team });
}

// ... and so on
```

---

## ⚠️ Important Notes

### About Users
- **Passwords are NOT included** in the seed files for security reasons
- User records are commented out in the SQL file
- You'll need to:
  1. Create users manually through the application, OR
  2. Hash passwords and insert them manually in SQL

### Default Users in Your System
Based on the export, you have 3 users:
1. **Admin user** (role: ADMIN)
2. **Steward users** (role: STEWARD)

**To recreate users:**
```sql
-- Example: Create admin user with password 'password123'
INSERT INTO User (username, password, role, createdAt, updatedAt) VALUES
('admin', '$2b$10$...hashed_password...', 'ADMIN', NOW(), NOW());
```

### Foreign Key Constraints
The SQL file automatically:
- ✅ Disables foreign key checks before import
- ✅ Re-enables them after import
- ✅ Resets auto-increment values

---

## 🔄 Re-exporting Data

If you make changes and want to export again:

```bash
cd server
node scripts/export-seed-data.js
```

This will overwrite the existing seed files with fresh data.

---

## 📋 SQL File Structure

The `SEED_DATA.sql` file contains data in this order:
1. Seasons
2. Teams
3. Drivers
4. Circuits
5. Races
6. Penalties
7. Race Results
8. Race Incidents
9. Users (commented out - needs passwords)

---

## 🎯 Use Cases

### 1. **Fresh Installation**
Run `SEED_DATA.sql` on a new database to get started with your data.

### 2. **Development/Testing**
Reset your database and re-import seed data for testing.

### 3. **Backup**
Keep these files as a backup of your current state.

### 4. **Team Collaboration**
Share `SEED_DATA.sql` with team members so they have the same data.

---

## 🛠️ Troubleshooting

### Issue: "Duplicate entry" error
**Solution:** The data already exists. Either:
- Clear the tables first (uncomment TRUNCATE statements in SQL file), OR
- Skip existing records

### Issue: "Foreign key constraint fails"
**Solution:** Make sure you're importing in the correct order (the SQL file handles this automatically)

### Issue: Users can't login
**Solution:** User passwords need to be set manually. Create users through the application or hash passwords and insert them.

---

## ✅ Verification

After importing, verify your data:

```sql
-- Check record counts
SELECT 'Seasons' AS Table_Name, COUNT(*) AS Count FROM Season
UNION ALL
SELECT 'Teams', COUNT(*) FROM Team
UNION ALL
SELECT 'Drivers', COUNT(*) FROM Driver
UNION ALL
SELECT 'Circuits', COUNT(*) FROM Circuit
UNION ALL
SELECT 'Races', COUNT(*) FROM Race
UNION ALL
SELECT 'Race Results', COUNT(*) FROM RaceResult
UNION ALL
SELECT 'Race Incidents', COUNT(*) FROM RaceIncident
UNION ALL
SELECT 'Penalties', COUNT(*) FROM Penalty;
```

Expected results:
- Seasons: 3
- Teams: 5
- Drivers: 10
- Circuits: 10
- Races: 5
- Race Results: 42
- Race Incidents: 14
- Penalties: 13

---

## 📝 Notes

- Export date is included in both files
- All timestamps are preserved
- IDs are maintained to preserve relationships
- Auto-increment values are reset to continue from the last ID

---

**Your data is now safely backed up and ready to be restored anytime!** 🎉
