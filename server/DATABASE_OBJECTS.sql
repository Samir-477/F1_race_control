-- =====================================================
-- F1 RACE CONTROL - DATABASE OBJECTS
-- =====================================================
-- This file contains all stored procedures, functions, and triggers
-- Run this file in MySQL Workbench after setting up the database schema
-- 
-- Contents:
-- 1. Triggers (3) - Auto-created via Prisma migration
-- 2. Stored Procedures (2) - Must be created manually
-- 3. Functions (2) - Must be created manually
-- =====================================================

USE race_control;

-- =====================================================
-- SECTION 1: TRIGGERS
-- =====================================================
-- Note: These are already created via Prisma migration
-- (20251030131400_add_triggers_procedures_functions)
-- Listed here for reference only - DO NOT RUN THIS SECTION

/*
-- Trigger 1: Auto-update driver points when race result is inserted
CREATE TRIGGER after_race_result_insert
AFTER INSERT ON RaceResult
FOR EACH ROW
UPDATE Driver
SET points = points + NEW.points
WHERE id = NEW.driverId;

-- Trigger 2: Auto-update driver points when race result is updated
CREATE TRIGGER after_race_result_update
AFTER UPDATE ON RaceResult
FOR EACH ROW
UPDATE Driver
SET points = points - OLD.points + NEW.points
WHERE id = NEW.driverId;

-- Trigger 3: Auto-log penalty assignments for audit trail
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
*/

-- =====================================================
-- SECTION 2: STORED PROCEDURES
-- =====================================================

-- Drop existing procedures if they exist
DROP PROCEDURE IF EXISTS CalculateChampionshipStandings;
DROP PROCEDURE IF EXISTS GenerateRaceReport;

DELIMITER $$

-- Procedure 1: Calculate Championship Standings
CREATE PROCEDURE CalculateChampionshipStandings(
    IN p_seasonId INT
)
BEGIN
    SELECT 
        d.id AS driverId,
        d.name AS driverName,
        d.number AS driverNumber,
        t.id AS teamId,
        t.name AS teamName,
        t.color AS teamColor,
        SUM(rr.points) AS totalPoints,
        COUNT(rr.id) AS racesParticipated,
        COUNT(CASE WHEN rr.position = 1 THEN 1 END) AS wins,
        COUNT(CASE WHEN rr.position <= 3 THEN 1 END) AS podiums,
        AVG(rr.position) AS avgPosition
    FROM Driver d
    INNER JOIN Team t ON d.teamId = t.id
    LEFT JOIN RaceResult rr ON d.id = rr.driverId
    LEFT JOIN Race r ON rr.raceId = r.id
    WHERE r.seasonId = p_seasonId OR r.seasonId IS NULL
    GROUP BY d.id, d.name, d.number, t.id, t.name, t.color
    ORDER BY totalPoints DESC, wins DESC, podiums DESC;
END$$

-- Procedure 2: Generate Race Report
CREATE PROCEDURE GenerateRaceReport(
    IN p_raceId INT
)
BEGIN
    -- Race basic info
    SELECT 
        r.id,
        r.name AS raceName,
        r.date,
        r.status,
        c.name AS circuitName,
        c.location AS circuitLocation,
        c.country AS circuitCountry,
        c.length AS circuitLength,
        c.laps AS totalLaps,
        s.year AS seasonYear,
        s.name AS seasonName
    FROM Race r
    INNER JOIN Circuit c ON r.circuitId = c.id
    INNER JOIN Season s ON r.seasonId = s.id
    WHERE r.id = p_raceId;
    
    -- Race results
    SELECT 
        rr.position,
        d.name AS driverName,
        d.number AS driverNumber,
        t.name AS teamName,
        t.color AS teamColor,
        rr.time,
        rr.points,
        rr.penalty,
        rr.fastestLap
    FROM RaceResult rr
    INNER JOIN Driver d ON rr.driverId = d.id
    INNER JOIN Team t ON rr.teamId = t.id
    WHERE rr.raceId = p_raceId
    ORDER BY rr.position ASC;
    
    -- Race incidents
    SELECT 
        ri.lap,
        ri.description,
        d.name AS driverName,
        d.number AS driverNumber,
        t.name AS teamName,
        p.type AS penaltyType,
        p.value AS penaltyValue
    FROM RaceIncident ri
    INNER JOIN Driver d ON ri.driverId = d.id
    INNER JOIN Team t ON d.teamId = t.id
    LEFT JOIN Penalty p ON ri.penaltyId = p.id
    WHERE ri.raceId = p_raceId
    ORDER BY ri.lap ASC;
    
    -- Race statistics
    SELECT 
        COUNT(DISTINCT rr.driverId) AS totalDrivers,
        COUNT(DISTINCT rr.teamId) AS totalTeams,
        COUNT(ri.id) AS totalIncidents,
        COUNT(CASE WHEN ri.penaltyId IS NOT NULL THEN 1 END) AS penaltiesIssued,
        MIN(rr.time) AS fastestRaceTime,
        MIN(rr.fastestLap) AS fastestLap
    FROM RaceResult rr
    LEFT JOIN RaceIncident ri ON ri.raceId = rr.raceId
    WHERE rr.raceId = p_raceId;
END$$

DELIMITER ;

-- =====================================================
-- SECTION 3: FUNCTIONS
-- =====================================================

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS CalculateRaceTimeWithPenalties;
DROP FUNCTION IF EXISTS GetDriverPerformanceRating;

DELIMITER $$

-- Function 1: Calculate total race time with penalties
CREATE FUNCTION CalculateRaceTimeWithPenalties(
    p_driverId INT,
    p_raceId INT
)
RETURNS DECIMAL(10,3)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE baseTime DECIMAL(10,3);
    DECLARE totalPenalty DECIMAL(10,3);
    DECLARE finalTime DECIMAL(10,3);
    
    -- Get base race time (convert time string to seconds)
    SELECT 
        CASE 
            WHEN time LIKE '%:%' THEN 
                (CAST(SUBSTRING_INDEX(time, ':', 1) AS DECIMAL) * 60) + 
                CAST(SUBSTRING_INDEX(time, ':', -1) AS DECIMAL)
            ELSE 0
        END INTO baseTime
    FROM RaceResult
    WHERE driverId = p_driverId AND raceId = p_raceId
    LIMIT 1;
    
    -- Calculate total time penalties
    SELECT COALESCE(SUM(
        CASE 
            WHEN p.type = 'TimePenalty' THEN 
                CAST(REGEXP_REPLACE(p.value, '[^0-9.]', '') AS DECIMAL)
            ELSE 0
        END
    ), 0) INTO totalPenalty
    FROM RaceIncident ri
    INNER JOIN Penalty p ON ri.penaltyId = p.id
    WHERE ri.driverId = p_driverId AND ri.raceId = p_raceId;
    
    SET finalTime = baseTime + totalPenalty;
    
    RETURN finalTime;
END$$

-- Function 2: Calculate driver performance rating
CREATE FUNCTION GetDriverPerformanceRating(
    p_driverId INT,
    p_seasonId INT
)
RETURNS DECIMAL(5,2)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE totalRaces INT;
    DECLARE avgPosition DECIMAL(5,2);
    DECLARE totalPoints DECIMAL(10,2);
    DECLARE wins INT;
    DECLARE podiums INT;
    DECLARE incidents INT;
    DECLARE rating DECIMAL(5,2);
    
    -- Get race statistics
    SELECT 
        COUNT(*) INTO totalRaces
    FROM RaceResult rr
    INNER JOIN Race r ON rr.raceId = r.id
    WHERE rr.driverId = p_driverId AND r.seasonId = p_seasonId;
    
    IF totalRaces = 0 THEN
        RETURN 0;
    END IF;
    
    -- Calculate metrics
    SELECT 
        AVG(rr.position),
        SUM(rr.points),
        COUNT(CASE WHEN rr.position = 1 THEN 1 END),
        COUNT(CASE WHEN rr.position <= 3 THEN 1 END)
    INTO avgPosition, totalPoints, wins, podiums
    FROM RaceResult rr
    INNER JOIN Race r ON rr.raceId = r.id
    WHERE rr.driverId = p_driverId AND r.seasonId = p_seasonId;
    
    -- Count incidents
    SELECT COUNT(*) INTO incidents
    FROM RaceIncident ri
    INNER JOIN Race r ON ri.raceId = r.id
    WHERE ri.driverId = p_driverId AND r.seasonId = p_seasonId;
    
    -- Calculate rating (0-100 scale)
    -- Formula: (Points × 2) + (Wins × 10) + (Podiums × 5) - (Avg Position × 2) - (Incidents × 3)
    SET rating = (totalPoints * 2) + (wins * 10) + (podiums * 5) - (avgPosition * 2) - (incidents * 3);
    
    -- Normalize to 0-100
    IF rating < 0 THEN
        SET rating = 0;
    ELSEIF rating > 100 THEN
        SET rating = 100;
    END IF;
    
    RETURN rating;
END$$

DELIMITER ;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check created procedures
SHOW PROCEDURE STATUS WHERE Db = 'race_control';

-- Check created functions
SHOW FUNCTION STATUS WHERE Db = 'race_control';

-- Check existing triggers (created via migration)
SHOW TRIGGERS FROM race_control;

-- =====================================================
-- TESTING (Optional)
-- =====================================================

-- Test Procedure 1: Championship Standings
-- CALL CalculateChampionshipStandings(1);

-- Test Procedure 2: Race Report
-- CALL GenerateRaceReport(1);

-- Test Function 1: Race Time with Penalties
-- SELECT CalculateRaceTimeWithPenalties(1, 1) AS totalTime;

-- Test Function 2: Driver Performance Rating
-- SELECT GetDriverPerformanceRating(1, 1) AS rating;

-- =====================================================
-- END OF FILE
-- =====================================================

SELECT '✅ Database objects script completed!' AS Status;
SELECT 'Run the verification queries above to confirm all objects were created.' AS NextStep;
