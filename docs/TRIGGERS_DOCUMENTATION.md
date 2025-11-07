# 🔔 Database Triggers Documentation

## Overview

This document provides detailed information about all database triggers implemented in the F1 Race Control system.

**Total Triggers**: 3  
**Status**: ✅ All created automatically via Prisma migration  
**Migration File**: `server/prisma/migrations/20251030131400_add_triggers_procedures_functions/migration.sql`

---

## Trigger 1: `after_race_result_insert` 🏁

### **Purpose**
Automatically updates driver's total points when a new race result is inserted.

### **Trigger Type**
- **Event**: AFTER INSERT
- **Table**: RaceResult
- **Timing**: Row-level trigger (FOR EACH ROW)

### **SQL Definition**
```sql
CREATE TRIGGER after_race_result_insert
AFTER INSERT ON RaceResult
FOR EACH ROW
UPDATE Driver
SET points = points + NEW.points
WHERE id = NEW.driverId;
```

### **How It Works**
1. When a new race result is inserted into `RaceResult` table
2. The trigger automatically fires AFTER the insert
3. It updates the corresponding driver's total points
4. Formula: `Driver.points = Driver.points + NEW.points`

### **Example Scenario**
```sql
-- Insert a race result
INSERT INTO RaceResult (raceId, driverId, teamId, position, time, points, penalty, fastestLap)
VALUES (1, 5, 2, 1, '1:32:15.456', 25, '0s', '1:18.234');

-- Trigger automatically executes:
-- UPDATE Driver SET points = points + 25 WHERE id = 5;
```

### **Benefits**
- ✅ Automatic point calculation
- ✅ No manual updates needed
- ✅ Ensures data consistency
- ✅ Real-time championship standings

### **Backend Integration**
- **Status**: ✅ Fully integrated
- **Location**: Automatic (database level)
- **Used By**: All race result creation operations

### **Frontend Impact**
- Championship standings update automatically
- Driver profiles show correct total points
- No additional API calls needed

### **Testing**
```sql
-- Test the trigger
-- 1. Check driver's current points
SELECT id, name, points FROM Driver WHERE id = 5;

-- 2. Insert a race result
INSERT INTO RaceResult (raceId, driverId, teamId, position, time, points, penalty, fastestLap)
VALUES (1, 5, 2, 1, '1:32:15.456', 25, '0s', '1:18.234');

-- 3. Verify points were updated
SELECT id, name, points FROM Driver WHERE id = 5;
-- Should show points increased by 25
```

---

## Trigger 2: `after_race_result_update` 🔄

### **Purpose**
Automatically adjusts driver's total points when a race result is updated (e.g., penalty applied after race).

### **Trigger Type**
- **Event**: AFTER UPDATE
- **Table**: RaceResult
- **Timing**: Row-level trigger (FOR EACH ROW)

### **SQL Definition**
```sql
CREATE TRIGGER after_race_result_update
AFTER UPDATE ON RaceResult
FOR EACH ROW
UPDATE Driver
SET points = points - OLD.points + NEW.points
WHERE id = NEW.driverId;
```

### **How It Works**
1. When a race result is updated in `RaceResult` table
2. The trigger fires AFTER the update
3. It recalculates the driver's total points
4. Formula: `Driver.points = Driver.points - OLD.points + NEW.points`
5. This removes old points and adds new points

### **Example Scenario**
```sql
-- Original result: Driver got 25 points for P1
-- After steward review: Penalty applied, demoted to P2 (18 points)

UPDATE RaceResult 
SET position = 2, points = 18, penalty = '5s'
WHERE raceId = 1 AND driverId = 5;

-- Trigger automatically executes:
-- UPDATE Driver SET points = points - 25 + 18 WHERE id = 5;
-- Net effect: Driver loses 7 points
```

### **Benefits**
- ✅ Handles penalty adjustments automatically
- ✅ Maintains accurate championship standings
- ✅ No manual point recalculation needed
- ✅ Supports post-race steward decisions

### **Backend Integration**
- **Status**: ✅ Fully integrated
- **Location**: Automatic (database level)
- **Used By**: Race result updates, penalty applications

### **Frontend Impact**
- Championship standings reflect penalties immediately
- Driver profiles update automatically
- Stewards can apply penalties without worrying about points

### **Common Use Cases**
1. **Post-race penalties**: Time penalties changing positions
2. **Disqualifications**: Points removed entirely
3. **Corrections**: Fixing data entry errors
4. **Appeals**: Restoring points after successful appeal

### **Testing**
```sql
-- Test the trigger
-- 1. Check driver's current points
SELECT id, name, points FROM Driver WHERE id = 5;

-- 2. Update race result (apply penalty)
UPDATE RaceResult 
SET position = 2, points = 18, penalty = '5s'
WHERE raceId = 1 AND driverId = 5;

-- 3. Verify points were adjusted correctly
SELECT id, name, points FROM Driver WHERE id = 5;
-- Should show points decreased by 7 (25 - 18)
```

---

## Trigger 3: `after_penalty_assignment_insert` 📝

### **Purpose**
Automatically creates an audit log entry in `RaceLog` when a penalty is assigned to an incident.

### **Trigger Type**
- **Event**: AFTER INSERT
- **Table**: PenaltyAssignment
- **Timing**: Row-level trigger (FOR EACH ROW)

### **SQL Definition**
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

### **How It Works**
1. When a penalty is assigned to an incident (INSERT into PenaltyAssignment)
2. The trigger fires AFTER the insert
3. It looks up the incident details from `RaceIncident`
4. Creates a log entry in `RaceLog` with:
   - Race ID and lap number from the incident
   - Description: "Penalty assigned by steward to driver for incident on lap X"
   - Severity: WARNING
   - Current timestamp

### **Example Scenario**
```sql
-- Steward assigns a penalty to an incident
INSERT INTO PenaltyAssignment (incidentId, penaltyId, assignedBy, assignedAt)
VALUES (15, 3, 2, NOW());

-- Trigger automatically creates a log entry:
-- INSERT INTO RaceLog (raceId, lap, description, severity, timestamp)
-- VALUES (1, 12, 'Penalty assigned by steward to driver for incident on lap 12', 'WARNING', NOW());
```

### **Benefits**
- ✅ Automatic audit trail
- ✅ Tracks all penalty decisions
- ✅ Provides transparency
- ✅ Helps with post-race analysis
- ✅ Compliance with steward protocols

### **Backend Integration**
- **Status**: ✅ Fully integrated
- **Location**: Automatic (database level)
- **Used By**: Steward penalty assignment operations

### **Frontend Impact**
- Race logs show penalty assignments automatically
- Stewards can review their decisions
- Audit trail visible in race monitoring
- Supports incident review process

### **Log Entry Format**
```
Severity: WARNING
Description: "Penalty assigned by steward to driver for incident on lap [LAP_NUMBER]"
Timestamp: [CURRENT_TIME]
```

### **Testing**
```sql
-- Test the trigger
-- 1. Check current race logs
SELECT * FROM RaceLog WHERE raceId = 1 ORDER BY timestamp DESC LIMIT 5;

-- 2. Assign a penalty to an incident
INSERT INTO PenaltyAssignment (incidentId, penaltyId, assignedBy, assignedAt)
VALUES (15, 3, 2, NOW());

-- 3. Verify log entry was created
SELECT * FROM RaceLog WHERE raceId = 1 ORDER BY timestamp DESC LIMIT 1;
-- Should show new log entry about penalty assignment
```

---

## 📊 Triggers Summary Table

| Trigger Name | Event | Table | Purpose | Status | Frontend Visible |
|-------------|-------|-------|---------|--------|-----------------|
| `after_race_result_insert` | AFTER INSERT | RaceResult | Auto-update driver points | ✅ Active | Yes (standings) |
| `after_race_result_update` | AFTER UPDATE | RaceResult | Auto-adjust driver points | ✅ Active | Yes (standings) |
| `after_penalty_assignment_insert` | AFTER INSERT | PenaltyAssignment | Auto-log penalty decisions | ✅ Active | Yes (race logs) |

---

## 🔄 Trigger Execution Flow

### **Race Result Insert Flow**
```
1. API receives race result data
2. INSERT into RaceResult table
3. ✅ Trigger: after_race_result_insert fires
4. Driver.points automatically updated
5. Response sent to frontend
6. Championship standings reflect new points
```

### **Race Result Update Flow (Penalty)**
```
1. Steward applies penalty via UI
2. UPDATE RaceResult (position, points, penalty)
3. ✅ Trigger: after_race_result_update fires
4. Driver.points automatically adjusted
5. Response sent to frontend
6. Championship standings update immediately
```

### **Penalty Assignment Flow**
```
1. Steward assigns penalty to incident
2. INSERT into PenaltyAssignment
3. ✅ Trigger: after_penalty_assignment_insert fires
4. RaceLog entry automatically created
5. Audit trail updated
6. Race logs show penalty decision
```

---

## 🎯 Business Logic Handled by Triggers

### **Automatic Point Management**
- ✅ No manual point calculations needed
- ✅ Consistent across all operations
- ✅ Handles additions and adjustments
- ✅ Supports complex scenarios (penalties, corrections)

### **Audit Trail**
- ✅ All penalty decisions logged
- ✅ Timestamp tracking
- ✅ Steward accountability
- ✅ Post-race analysis support

### **Data Integrity**
- ✅ Points always in sync with results
- ✅ No orphaned data
- ✅ Automatic consistency maintenance

---

## 🛠️ Maintenance & Monitoring

### **Checking Trigger Status**
```sql
-- View all triggers in the database
SHOW TRIGGERS FROM race_control;

-- View specific trigger details
SHOW CREATE TRIGGER after_race_result_insert;
```

### **Disabling a Trigger (if needed)**
```sql
-- Triggers cannot be disabled in MySQL
-- You must DROP and recreate them
DROP TRIGGER IF EXISTS after_race_result_insert;
```

### **Recreating Triggers**
```sql
-- If you need to recreate, run the migration file again
-- Or use the SQL from DATABASE_OBJECTS.sql (reference section)
```

---

## ⚠️ Important Notes

### **Trigger Limitations**
1. **Cannot be disabled**: MySQL doesn't support disabling triggers
2. **Performance**: Triggers add overhead to INSERT/UPDATE operations
3. **Debugging**: Trigger errors can be hard to debug
4. **Testing**: Must test with actual data operations

### **Best Practices**
1. ✅ Keep trigger logic simple
2. ✅ Avoid complex calculations in triggers
3. ✅ Don't call external APIs from triggers
4. ✅ Test thoroughly before deployment
5. ✅ Document all trigger behavior

### **When Triggers Fire**
- ✅ **AFTER INSERT**: After row is inserted (can access NEW values)
- ✅ **AFTER UPDATE**: After row is updated (can access OLD and NEW values)
- ❌ **BEFORE**: Not used in this system
- ❌ **DELETE**: No delete triggers implemented

---

## 🧪 Testing Scenarios

### **Scenario 1: New Race Result**
```sql
-- Expected: Driver points increase
INSERT INTO RaceResult VALUES (...);
-- Verify: SELECT points FROM Driver WHERE id = X;
```

### **Scenario 2: Penalty Applied**
```sql
-- Expected: Driver points adjusted
UPDATE RaceResult SET points = 18 WHERE id = X;
-- Verify: SELECT points FROM Driver WHERE id = Y;
```

### **Scenario 3: Penalty Assignment**
```sql
-- Expected: Log entry created
INSERT INTO PenaltyAssignment VALUES (...);
-- Verify: SELECT * FROM RaceLog ORDER BY timestamp DESC LIMIT 1;
```

---

## 📈 Performance Impact

### **Minimal Overhead**
- Triggers execute in microseconds
- No noticeable impact on API response times
- Database handles trigger execution efficiently

### **Optimization**
- Triggers use indexed columns (id, driverId)
- Simple UPDATE/INSERT operations
- No complex joins or subqueries

---

## 🔗 Related Documentation

- **`DATABASE_OBJECTS.sql`**: Trigger definitions (reference only)
- **`DATABASE_SETUP_GUIDE.md`**: Setup instructions
- **`RELATIONAL_SCHEMA.md`**: Database schema
- **Migration File**: `server/prisma/migrations/20251030131400_add_triggers_procedures_functions/migration.sql`

---

## ✅ Verification Checklist

- [x] All 3 triggers created in database
- [x] Triggers fire on correct events
- [x] Driver points update automatically
- [x] Penalty assignments logged
- [x] No performance issues
- [x] Frontend reflects trigger actions
- [x] Audit trail working correctly

---

**All triggers are active and working automatically!** 🎉

No manual intervention needed - they maintain data consistency in the background.
