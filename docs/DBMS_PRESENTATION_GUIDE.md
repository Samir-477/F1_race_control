# F1 Race Control - DBMS Features Presentation Guide

## 📋 Overview
This guide explains all DBMS features implemented in your F1 Race Control project, including **Triggers**, **Stored Procedures**, and **Functions**.

---

## 🎯 Database Features Summary

### ✅ What You Have Implemented:
1. **3 Triggers** - Automatic data updates and audit logging
2. **2 Stored Procedures** - Complex business logic operations
3. **2 Functions** - Reusable calculations
4. **Comprehensive Database Schema** - 15+ tables with proper relationships

---

## 🔥 TRIGGERS (3 Total)

### 1. **after_race_result_insert**
**Purpose**: Automatically update driver points when a new race result is added

**How it works**:
- **WHEN**: After inserting a new record in `RaceResult` table
- **ACTION**: Adds the race points to the driver's total points in `Driver` table
- **Example**: If Hamilton finishes P1 (25 points), his total points automatically increase by 25

```sql
CREATE TRIGGER after_race_result_insert
AFTER INSERT ON RaceResult
FOR EACH ROW
UPDATE Driver
SET points = points + NEW.points
WHERE id = NEW.driverId;
```

**Real-world benefit**: No manual calculation needed - points are always accurate!

---

### 2. **after_race_result_update**
**Purpose**: Adjust driver points when race results are corrected/updated

**How it works**:
- **WHEN**: After updating a record in `RaceResult` table
- **ACTION**: Removes old points and adds new points to driver's total
- **Example**: If a penalty changes Hamilton's P1 to P2 (25→18 points), his total automatically adjusts (-25 +18 = -7 points)

```sql
CREATE TRIGGER after_race_result_update
AFTER UPDATE ON RaceResult
FOR EACH ROW
UPDATE Driver
SET points = points - OLD.points + NEW.points
WHERE id = NEW.driverId;
```

**Real-world benefit**: Handles penalty corrections automatically!

---

### 3. **after_penalty_assignment_insert**
**Purpose**: Create an audit trail log when penalties are assigned

**How it works**:
- **WHEN**: After a penalty is assigned to an incident
- **ACTION**: Automatically creates a log entry in `RaceLog` table with incident details
- **Example**: When a steward assigns a 5-second penalty, it's automatically logged with lap number and timestamp

```sql
CREATE TRIGGER after_penalty_assignment_insert
AFTER INSERT ON PenaltyAssignment
FOR EACH ROW
INSERT INTO RaceLog (raceId, lap, description, severity, timestamp, createdAt, updatedAt)
SELECT 
    ri.raceId,
    ri.lap,
    CONCAT('Penalty assigned by steward to driver for incident on lap ', ri.lap),
    'WARNING',
    NOW(),
    NOW(),
    NOW()
FROM RaceIncident ri
WHERE ri.id = NEW.incidentId;
```

**Real-world benefit**: Complete audit trail for compliance and transparency!

---

## 📦 STORED PROCEDURES (2 Total)

### 1. **CalculateChampionshipStandings**
**Purpose**: Generate driver or team championship standings for a season

**Parameters**:
- `p_seasonId` (INT) - Which season to calculate
- `p_type` (VARCHAR) - 'driver' or 'team'

**What it returns**:
- **For Drivers**: Name, team, total points, wins, podiums, races participated
- **For Teams**: Team name, total points, wins, podiums, races participated
- **Sorted by**: Points (DESC), then wins, then podiums

**How to call**:
```sql
-- Get driver standings for season 1
CALL CalculateChampionshipStandings(1, 'driver');

-- Get team standings for season 1
CALL CalculateChampionshipStandings(1, 'team');
```

**Real-world benefit**: Instant championship leaderboard generation!

---

### 2. **GenerateRaceReport**
**Purpose**: Create a comprehensive report for a specific race

**Parameters**:
- `p_raceId` (INT) - Which race to report on

**What it returns** (3 result sets):
1. **Race Basic Info**: Circuit details, date, status, total finishers, incidents, penalties
2. **Race Results**: Position, driver, team, time, points, penalties, fastest lap
3. **Incidents & Penalties**: Lap, driver, description, penalty type/value, steward name

**How to call**:
```sql
-- Generate full report for race ID 1
CALL GenerateRaceReport(1);
```

**Real-world benefit**: Complete race analysis in one query!

---

## 🧮 FUNCTIONS (2 Total)

### 1. **CalculateRaceTimeWithPenalties**
**Purpose**: Calculate a driver's final race time including all time penalties

**Parameters**:
- `p_driverId` (INT) - Driver ID
- `p_raceId` (INT) - Race ID

**Returns**: DECIMAL(10,3) - Total time in seconds

**How it works**:
1. Gets base race time from `RaceResult`
2. Sums all time penalties from `RaceIncident` and `Penalty` tables
3. Returns: base time + penalties

**How to use**:
```sql
-- Get Hamilton's (driver ID 1) final time for race 1
SELECT CalculateRaceTimeWithPenalties(1, 1) AS finalTime;
```

**Real-world benefit**: Accurate final times with penalties applied!

---

### 2. **GetDriverPerformanceRating**
**Purpose**: Calculate a performance rating (0-100) for a driver in a season

**Parameters**:
- `p_driverId` (INT) - Driver ID
- `p_seasonId` (INT) - Season ID

**Returns**: DECIMAL(5,2) - Rating from 0 to 100

**How it calculates**:
- **Positive factors**: Points (×2), Wins (×10), Podiums (×5)
- **Negative factors**: Average position (×2), Incidents (×3)
- **Formula**: `(points×2) + (wins×10) + (podiums×5) - (avgPosition×2) - (incidents×3)`
- **Normalized**: 0-100 scale

**How to use**:
```sql
-- Get Verstappen's (driver ID 1) rating for season 1
SELECT GetDriverPerformanceRating(1, 1) AS performanceRating;
```

**Real-world benefit**: Objective driver performance comparison!

---

## 🖥️ How to View in MySQL Workbench (GUI)

### **Step 1: View All Triggers**
1. Open MySQL Workbench
2. Connect to your database
3. In left sidebar, expand `race_control` database
4. Click on **"Triggers"** folder
5. You'll see all 3 triggers listed

**OR run this query**:
```sql
SELECT 
    TRIGGER_NAME,
    EVENT_MANIPULATION AS Event,
    EVENT_OBJECT_TABLE AS TableName,
    ACTION_TIMING AS Timing
FROM information_schema.TRIGGERS
WHERE TRIGGER_SCHEMA = 'race_control';
```

### **Step 2: View All Stored Procedures**
1. In left sidebar, expand `race_control` database
2. Click on **"Stored Procedures"** folder
3. You'll see both procedures listed
4. **Right-click** on any procedure → **"Alter Stored Procedure"** to see the code

**OR run this query**:
```sql
SHOW PROCEDURE STATUS WHERE Db = 'race_control';
```

**To see procedure code**:
```sql
SHOW CREATE PROCEDURE CalculateChampionshipStandings;
```

### **Step 3: View All Functions**
1. In left sidebar, expand `race_control` database
2. Click on **"Functions"** folder
3. You'll see both functions listed
4. **Right-click** on any function → **"Alter Function"** to see the code

**OR run this query**:
```sql
SHOW FUNCTION STATUS WHERE Db = 'race_control';
```

**To see function code**:
```sql
SHOW CREATE FUNCTION CalculateRaceTimeWithPenalties;
```

### **Step 4: Verify Everything Exists**
Run the verification script:
```sql
USE race_control;

-- Check all database objects
SELECT 
    (SELECT COUNT(*) FROM information_schema.ROUTINES 
     WHERE ROUTINE_SCHEMA = 'race_control' AND ROUTINE_TYPE = 'PROCEDURE') AS TotalProcedures,
    (SELECT COUNT(*) FROM information_schema.ROUTINES 
     WHERE ROUTINE_SCHEMA = 'race_control' AND ROUTINE_TYPE = 'FUNCTION') AS TotalFunctions,
    (SELECT COUNT(*) FROM information_schema.TRIGGERS 
     WHERE TRIGGER_SCHEMA = 'race_control') AS TotalTriggers;
```

**Expected Result**: 2 Procedures, 2 Functions, 3 Triggers

---

## 🧪 Testing Your DBMS Features

### **Test Triggers**

#### Test 1: Insert Race Result (Trigger 1)
```sql
-- Check driver points before
SELECT name, points FROM Driver WHERE id = 1;

-- Insert a race result
INSERT INTO RaceResult (position, time, points, penalty, fastestLap, raceId, driverId, teamId)
VALUES (1, '1:32:15.123', 25, '0s', '1:18.456', 1, 1, 1);

-- Check driver points after (should increase by 25)
SELECT name, points FROM Driver WHERE id = 1;
```

#### Test 2: Update Race Result (Trigger 2)
```sql
-- Update the result (change points from 25 to 18)
UPDATE RaceResult 
SET points = 18, position = 2 
WHERE driverId = 1 AND raceId = 1;

-- Check driver points (should decrease by 7)
SELECT name, points FROM Driver WHERE id = 1;
```

#### Test 3: Penalty Assignment (Trigger 3)
```sql
-- Check RaceLog before
SELECT COUNT(*) FROM RaceLog WHERE raceId = 1;

-- Assign a penalty
INSERT INTO PenaltyAssignment (incidentId, stewardId, status)
VALUES (1, 1, 'PENDING');

-- Check RaceLog after (should have new entry)
SELECT * FROM RaceLog WHERE raceId = 1 ORDER BY id DESC LIMIT 1;
```

---

### **Test Stored Procedures**

#### Test Procedure 1: Championship Standings
```sql
-- Get driver championship
CALL CalculateChampionshipStandings(1, 'driver');

-- Get team championship
CALL CalculateChampionshipStandings(1, 'team');
```

#### Test Procedure 2: Race Report
```sql
-- Generate race report
CALL GenerateRaceReport(1);
```

---

### **Test Functions**

#### Test Function 1: Race Time with Penalties
```sql
-- Calculate final time for driver 1 in race 1
SELECT 
    d.name AS driverName,
    CalculateRaceTimeWithPenalties(1, 1) AS finalTimeSeconds
FROM Driver d WHERE d.id = 1;
```

#### Test Function 2: Performance Rating
```sql
-- Get performance rating for driver 1 in season 1
SELECT 
    d.name AS driverName,
    GetDriverPerformanceRating(1, 1) AS performanceRating
FROM Driver d WHERE d.id = 1;
```

---

## 📊 Database Schema Highlights

### **Key Tables** (15 total):
1. **User** - Admin and steward accounts
2. **Team** - F1 teams (Mercedes, Red Bull, etc.)
3. **Driver** - F1 drivers with stats
4. **Car** - Team cars (1-to-1 with Team)
5. **Sponsor** - Team sponsors (Many-to-Many)
6. **Circuit** - Race tracks
7. **Season** - Championship seasons
8. **Race** - Individual races
9. **RaceResult** - Race finishing positions
10. **RaceIncident** - On-track incidents
11. **Penalty** - Penalty definitions
12. **PenaltyAssignment** - Steward penalty assignments
13. **RaceLog** - Audit trail logs
14. **RaceParticipation** - Team participation in races

### **Key Relationships**:
- **One-to-Many**: Team → Drivers, Season → Races, Race → Results
- **One-to-One**: Team ↔ Car, RaceIncident ↔ Penalty
- **Many-to-Many**: Team ↔ Sponsors (via join table)
- **Cascade Deletes**: Deleting a team deletes all its drivers and results

---

## 🎤 Presentation Tips

### **What to Say to Your Teacher**:

1. **"We have 3 triggers for automatic data management"**
   - Show the triggers in MySQL Workbench
   - Explain: "When a race result is added, driver points update automatically"
   - Demonstrate: Insert a result and show points changing

2. **"We have 2 stored procedures for complex operations"**
   - Show procedures in MySQL Workbench
   - Run: `CALL CalculateChampionshipStandings(1, 'driver');`
   - Explain: "This generates the championship leaderboard instantly"

3. **"We have 2 functions for calculations"**
   - Show functions in MySQL Workbench
   - Run: `SELECT GetDriverPerformanceRating(1, 1);`
   - Explain: "This calculates a 0-100 performance score based on multiple factors"

4. **"The database reflects everything in real-time"**
   - Show the schema diagram (if available)
   - Explain relationships: "Teams have drivers, drivers have results, results trigger point updates"
   - Show data: `SELECT * FROM Driver;` to prove data exists

---

## ✅ Quick Verification Checklist

Before your presentation, run these queries:

```sql
-- 1. Check all objects exist
USE race_control;
SELECT 
    (SELECT COUNT(*) FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA = 'race_control') AS Triggers,
    (SELECT COUNT(*) FROM information_schema.ROUTINES WHERE ROUTINE_SCHEMA = 'race_control' AND ROUTINE_TYPE = 'PROCEDURE') AS Procedures,
    (SELECT COUNT(*) FROM information_schema.ROUTINES WHERE ROUTINE_SCHEMA = 'race_control' AND ROUTINE_TYPE = 'FUNCTION') AS Functions;

-- 2. Check data exists
SELECT 
    (SELECT COUNT(*) FROM Team) AS Teams,
    (SELECT COUNT(*) FROM Driver) AS Drivers,
    (SELECT COUNT(*) FROM Race) AS Races,
    (SELECT COUNT(*) FROM RaceResult) AS Results;

-- 3. Test a procedure
CALL CalculateChampionshipStandings(1, 'driver');

-- 4. Test a function
SELECT GetDriverPerformanceRating(1, 1) AS Rating;
```

**Expected Results**:
- ✅ 3 Triggers, 2 Procedures, 2 Functions
- ✅ Data in all tables
- ✅ Procedures and functions execute without errors

---

## 🚨 If Something Doesn't Work

### **If Procedures/Functions Don't Exist**:
1. Open MySQL Workbench
2. Open file: `MANUAL_SQL_SETUP.sql`
3. Run the entire file (it will create all procedures and functions)
4. Verify with: `SHOW PROCEDURE STATUS WHERE Db = 'race_control';`

### **If Triggers Don't Exist**:
They should be created automatically by Prisma migrations. If not:
1. Check migration file: `20251030131400_add_triggers_procedures_functions/migration.sql`
2. Run it manually in MySQL Workbench

### **If No Data Exists**:
1. Run: `INSERT_SAMPLE_DATA.sql` or `INSERT_SAMPLE_DATA_FIXED.sql`
2. This will populate teams, drivers, races, and results

---

## 📝 Summary for Teacher

**"Our F1 Race Control system uses advanced DBMS features:"**

1. **3 Triggers** - Automatic point updates and audit logging
2. **2 Stored Procedures** - Championship standings and race reports
3. **2 Functions** - Time calculations and performance ratings
4. **15+ Tables** - Complete F1 race management schema
5. **Real-time Reflection** - All data changes are immediately reflected through triggers

**"Everything is working and can be demonstrated in MySQL Workbench GUI."**

---

Good luck with your presentation! 🏎️🏁
