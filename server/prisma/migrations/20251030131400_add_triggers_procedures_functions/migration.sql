-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger 1: Auto-update driver points when race result is inserted/updated
CREATE TRIGGER after_race_result_insert
AFTER INSERT ON RaceResult
FOR EACH ROW
UPDATE Driver
SET points = points + NEW.points
WHERE id = NEW.driverId;

CREATE TRIGGER after_race_result_update
AFTER UPDATE ON RaceResult
FOR EACH ROW
UPDATE Driver
SET points = points - OLD.points + NEW.points
WHERE id = NEW.driverId;

-- Trigger 2: Auto-log penalty assignments for audit trail
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

-- Note: Stored procedures and functions with complex logic cannot be created via Prisma migrations
-- They need to be created manually using MySQL client or workbench
-- See MANUAL_SQL_SETUP.sql for the complete SQL to run manually

