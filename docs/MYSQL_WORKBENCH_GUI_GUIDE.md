# MySQL Workbench GUI Guide - Finding Triggers, Procedures & Functions

## 🎯 Quick Navigation Guide

This guide shows you **exactly where to click** in MySQL Workbench to view your DBMS features.

---

## 📍 Step-by-Step: Opening MySQL Workbench

1. **Open MySQL Workbench** application
2. **Click** on your database connection (usually shows as `Local instance MySQL`)
3. **Enter password** if prompted
4. You should now see the main workbench interface

---

## 🔍 Finding Your Database Objects

### **Left Sidebar - Navigator Panel**

You should see a panel on the left called **"Navigator"** or **"Schemas"**

```
Navigator
├── Schemas
    ├── race_control  ← Your database
        ├── Tables
        ├── Views
        ├── Stored Procedures  ← CLICK HERE for procedures
        ├── Functions          ← CLICK HERE for functions
        └── ...
```

---

## 📦 Viewing Stored Procedures

### **Method 1: GUI Navigation**

1. In the **Navigator** panel (left sidebar)
2. Expand **"Schemas"** (click the ▶ arrow)
3. Find and expand **"race_control"** database
4. Click on **"Stored Procedures"** folder
5. You should see:
   - ✅ `CalculateChampionshipStandings`
   - ✅ `GenerateRaceReport`

### **To View Procedure Code:**
- **Right-click** on procedure name
- Select **"Alter Stored Procedure..."**
- Code will open in a new tab

### **Method 2: SQL Query**
Run this in a query tab:
```sql
SHOW PROCEDURE STATUS WHERE Db = 'race_control';
```

### **To See Full Code:**
```sql
SHOW CREATE PROCEDURE CalculateChampionshipStandings;
SHOW CREATE PROCEDURE GenerateRaceReport;
```

---

## 🧮 Viewing Functions

### **Method 1: GUI Navigation**

1. In the **Navigator** panel (left sidebar)
2. Expand **"Schemas"**
3. Expand **"race_control"** database
4. Click on **"Functions"** folder
5. You should see:
   - ✅ `CalculateRaceTimeWithPenalties`
   - ✅ `GetDriverPerformanceRating`

### **To View Function Code:**
- **Right-click** on function name
- Select **"Alter Function..."**
- Code will open in a new tab

### **Method 2: SQL Query**
Run this in a query tab:
```sql
SHOW FUNCTION STATUS WHERE Db = 'race_control';
```

### **To See Full Code:**
```sql
SHOW CREATE FUNCTION CalculateRaceTimeWithPenalties;
SHOW CREATE FUNCTION GetDriverPerformanceRating;
```

---

## 🔥 Viewing Triggers

### **Method 1: GUI Navigation (Per Table)**

Triggers are attached to specific tables, so you need to:

1. In the **Navigator** panel
2. Expand **"race_control"** → **"Tables"**
3. Find the table with triggers:
   - **RaceResult** table → has 2 triggers
   - **PenaltyAssignment** table → has 1 trigger
4. Expand the table (click ▶)
5. Click on **"Triggers"** under that table
6. You should see:
   - Under **RaceResult**:
     - ✅ `after_race_result_insert`
     - ✅ `after_race_result_update`
   - Under **PenaltyAssignment**:
     - ✅ `after_penalty_assignment_insert`

### **To View Trigger Code:**
- **Right-click** on trigger name
- Select **"Alter Trigger..."**
- Code will open in a new tab

### **Method 2: SQL Query (View All Triggers)**
Run this in a query tab:
```sql
SELECT 
    TRIGGER_NAME,
    EVENT_MANIPULATION AS Event,
    EVENT_OBJECT_TABLE AS TableName,
    ACTION_TIMING AS Timing
FROM information_schema.TRIGGERS
WHERE TRIGGER_SCHEMA = 'race_control'
ORDER BY TRIGGER_NAME;
```

### **To See Full Trigger Code:**
```sql
SHOW CREATE TRIGGER after_race_result_insert;
SHOW CREATE TRIGGER after_race_result_update;
SHOW CREATE TRIGGER after_penalty_assignment_insert;
```

---

## 📊 Viewing Tables and Data

### **View All Tables:**
1. Expand **"race_control"** → **"Tables"**
2. You should see 15+ tables:
   - Car
   - Circuit
   - Driver
   - Penalty
   - PenaltyAssignment
   - Race
   - RaceIncident
   - RaceLog
   - RaceParticipation
   - RaceResult
   - Season
   - Sponsor
   - Team
   - User
   - _prisma_migrations

### **View Table Data:**
- **Right-click** on any table
- Select **"Select Rows - Limit 1000"**
- Data will appear in a grid view

### **View Table Structure:**
- **Right-click** on any table
- Select **"Table Inspector"**
- Shows columns, indexes, foreign keys, triggers

---

## 🎬 Running Queries

### **Open a New Query Tab:**
1. Click **"File"** → **"New Query Tab"** (or press `Ctrl+T`)
2. Make sure you're using the correct database:
   ```sql
   USE race_control;
   ```
3. Type or paste your SQL commands
4. Click the **⚡ lightning bolt icon** to execute (or press `Ctrl+Enter`)

### **Execute Specific Lines:**
- **Highlight** the SQL you want to run
- Click the **⚡ lightning bolt icon** (or press `Ctrl+Shift+Enter`)

---

## 🧪 Testing Your Features in GUI

### **Test Procedure:**
1. Open new query tab
2. Type:
   ```sql
   USE race_control;
   CALL CalculateChampionshipStandings(1, 'driver');
   ```
3. Click ⚡ to execute
4. Results appear in **"Result Grid"** at bottom

### **Test Function:**
1. Open new query tab
2. Type:
   ```sql
   USE race_control;
   SELECT GetDriverPerformanceRating(1, 1) AS rating;
   ```
3. Click ⚡ to execute
4. Result appears in grid

### **Test Trigger (Indirect):**
Triggers execute automatically, so you test them by doing the action that triggers them:

1. Insert a race result:
   ```sql
   USE race_control;
   
   -- Check points before
   SELECT name, points FROM Driver WHERE id = 1;
   
   -- Insert result (trigger fires automatically)
   INSERT INTO RaceResult (position, time, points, penalty, fastestLap, raceId, driverId, teamId, createdAt, updatedAt)
   VALUES (1, '1:30:00', 25, '0s', '1:18.456', 1, 1, 1, NOW(), NOW());
   
   -- Check points after (should increase by 25)
   SELECT name, points FROM Driver WHERE id = 1;
   ```

---

## 🔍 Verification Checklist (Show Teacher)

### **1. Show Procedures Exist:**
Navigate to: `Schemas → race_control → Stored Procedures`

Should show:
- ✅ CalculateChampionshipStandings
- ✅ GenerateRaceReport

### **2. Show Functions Exist:**
Navigate to: `Schemas → race_control → Functions`

Should show:
- ✅ CalculateRaceTimeWithPenalties
- ✅ GetDriverPerformanceRating

### **3. Show Triggers Exist:**
Navigate to: `Schemas → race_control → Tables → RaceResult → Triggers`

Should show:
- ✅ after_race_result_insert
- ✅ after_race_result_update

Navigate to: `Schemas → race_control → Tables → PenaltyAssignment → Triggers`

Should show:
- ✅ after_penalty_assignment_insert

### **4. Show Data Exists:**
Right-click on **Driver** table → **"Select Rows - Limit 1000"**

Should show drivers with data

### **5. Run a Live Demo:**
Open query tab and run:
```sql
USE race_control;
CALL CalculateChampionshipStandings(1, 'driver');
```

Should display championship standings

---

## 🖼️ Visual Layout Reference

```
┌─────────────────────────────────────────────────────────────┐
│  MySQL Workbench                                      [_][□][X]│
├─────────────────────────────────────────────────────────────┤
│  File  Edit  View  Query  Database  Server  Tools  Help    │
├──────────┬──────────────────────────────────────────────────┤
│          │  Query Tab 1                              [+]    │
│ Navigator│  ┌────────────────────────────────────────────┐ │
│          │  │ USE race_control;                          │ │
│ Schemas  │  │ CALL CalculateChampionshipStandings(...);  │ │
│ ▼ race_  │  │                                            │ │
│   control│  │                                            │ │
│   ├Tables│  └────────────────────────────────────────────┘ │
│   ├Views │  ⚡ Execute  ↻ Refresh  💾 Save                │
│   ├Store │  ┌────────────────────────────────────────────┐ │
│   │ Proce│  │ Result Grid                                │ │
│   │ dures│  │ ┌──────┬──────────┬──────┬────────┬──────┐│ │
│   ├Functi│  │ │ id   │ name     │ team │ points │ wins ││ │
│   │ ons  │  │ ├──────┼──────────┼──────┼────────┼──────┤│ │
│   └...   │  │ │ 1    │ Hamilton │ Merc │ 250    │ 10   ││ │
│          │  │ └──────┴──────────┴──────┴────────┴──────┘│ │
│          │  └────────────────────────────────────────────┘ │
└──────────┴──────────────────────────────────────────────────┘
```

---

## 💡 Quick Tips

### **If Navigator Panel is Hidden:**
- Click **"View"** menu → **"Panels"** → **"Show Sidebar"**

### **If You Don't See Your Database:**
- Click the **"Refresh"** icon (↻) next to "Schemas"
- Or right-click on "Schemas" → **"Refresh All"**

### **If Procedures/Functions Don't Appear:**
They might not be created yet. Run:
```sql
-- Check if they exist
SHOW PROCEDURE STATUS WHERE Db = 'race_control';
SHOW FUNCTION STATUS WHERE Db = 'race_control';
```

If they don't exist, run the `MANUAL_SQL_SETUP.sql` file.

### **To Run an Entire SQL File:**
1. Click **"File"** → **"Open SQL Script..."**
2. Select your `.sql` file (e.g., `MANUAL_SQL_SETUP.sql`)
3. Click ⚡ to execute all

---

## 🎤 During Presentation

### **What to Show:**

1. **Open MySQL Workbench** ✅
2. **Navigate to Schemas → race_control** ✅
3. **Click "Stored Procedures"** → Show 2 procedures ✅
4. **Click "Functions"** → Show 2 functions ✅
5. **Expand Tables → RaceResult → Triggers** → Show 2 triggers ✅
6. **Expand Tables → PenaltyAssignment → Triggers** → Show 1 trigger ✅
7. **Open Query Tab** → Run demo commands ✅
8. **Show Results** → Explain what happened ✅

### **What to Say:**

> "As you can see in the Navigator panel, our database has 2 stored procedures for complex operations like calculating championship standings. We also have 2 functions for calculations like performance ratings. And here under the tables, you can see 3 triggers that automatically update driver points and create audit logs. Let me demonstrate one..."

Then run a live demo from `QUICK_DEMO_COMMANDS.sql`

---

## ✅ Final Checklist Before Presentation

- [ ] MySQL Workbench is installed and working
- [ ] Can connect to `race_control` database
- [ ] Navigator panel shows all objects
- [ ] 2 Procedures visible under "Stored Procedures"
- [ ] 2 Functions visible under "Functions"
- [ ] 3 Triggers visible under respective tables
- [ ] Sample data exists in tables
- [ ] Can run queries successfully
- [ ] `QUICK_DEMO_COMMANDS.sql` file is ready to copy/paste

---

Good luck! You've got this! 🚀🏎️
