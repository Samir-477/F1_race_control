-- =====================================================
-- MANUAL SQL SETUP FOR PROCEDURES AND FUNCTIONS
-- =====================================================
-- Run this file manually in MySQL Workbench or command line
-- These cannot be created via Prisma migrations due to DELIMITER requirements

USE race_control;

-- =====================================================
-- STORED PROCEDURES
-- =====================================================

-- Drop existing procedures if they exist
DROP PROCEDURE IF EXISTS CalculateChampionshipStandings;
DROP PROCEDURE IF EXISTS GenerateRaceReport;

-- Procedure 1: Calculate Championship Standings
DELIMITER $$

CREATE PROCEDURE CalculateChampionshipStandings(
    IN p_seasonId INT,
    IN p_type VARCHAR(10)
)
BEGIN
    IF p_type = 'driver' THEN
        -- Driver Championship Standings
        SELECT 
            d.id,
            d.name AS driverName,
            d.number,
            t.name AS teamName,
            t.color AS teamColor,
            SUM(rr.points) AS totalPoints,
            COUNT(CASE WHEN rr.position = 1 THEN 1 END) AS wins,
            COUNT(CASE WHEN rr.position <= 3 THEN 1 END) AS podiums,
            COUNT(rr.id) AS racesParticipated
        FROM Driver d
        INNER JOIN Team t ON d.teamId = t.id
        INNER JOIN RaceResult rr ON d.id = rr.driverId
        INNER JOIN Race r ON rr.raceId = r.id
        WHERE r.seasonId = p_seasonId
        GROUP BY d.id, d.name, d.number, t.name, t.color
        ORDER BY totalPoints DESC, wins DESC, podiums DESC;
    ELSE
        -- Team Championship Standings
        SELECT 
            t.id,
            t.name AS teamName,
            t.fullName,
            t.color,
            SUM(rr.points) AS totalPoints,
            COUNT(CASE WHEN rr.position = 1 THEN 1 END) AS wins,
            COUNT(CASE WHEN rr.position <= 3 THEN 1 END) AS podiums,
            COUNT(DISTINCT r.id) AS racesParticipated
        FROM Team t
        INNER JOIN RaceResult rr ON t.id = rr.teamId
        INNER JOIN Race r ON rr.raceId = r.id
        WHERE r.seasonId = p_seasonId
        GROUP BY t.id, t.name, t.fullName, t.color
        ORDER BY totalPoints DESC, wins DESC, podiums DESC;
    END IF;
END$$

-- Procedure 2: Generate Comprehensive Race Report
CREATE PROCEDURE GenerateRaceReport(IN p_raceId INT)
BEGIN
    -- Race Basic Info
    SELECT 
        r.id,
        r.name AS raceName,
        r.date,
        r.status,
        c.name AS circuitName,
        c.location,
        c.country,
        c.length AS circuitLength,
        c.laps,
        s.year AS season,
        COUNT(DISTINCT rr.id) AS totalFinishers,
        COUNT(DISTINCT ri.id) AS totalIncidents,
        COUNT(DISTINCT pa.id) AS totalPenalties
    FROM Race r
    INNER JOIN Circuit c ON r.circuitId = c.id
    INNER JOIN Season s ON r.seasonId = s.id
    LEFT JOIN RaceResult rr ON r.id = rr.raceId
    LEFT JOIN RaceIncident ri ON r.id = ri.raceId
    LEFT JOIN PenaltyAssignment pa ON ri.id = pa.incidentId
    WHERE r.id = p_raceId
    GROUP BY r.id, r.name, r.date, r.status, c.name, c.location, c.country, c.length, c.laps, s.year;

    -- Race Results
    SELECT 
        rr.position,
        d.name AS driverName,
        d.number,
        t.name AS teamName,
        rr.time,
        rr.points,
        rr.penalty,
        rr.fastestLap
    FROM RaceResult rr
    INNER JOIN Driver d ON rr.driverId = d.id
    INNER JOIN Team t ON rr.teamId = t.id
    WHERE rr.raceId = p_raceId
    ORDER BY rr.position;

    -- Incidents and Penalties
    SELECT 
        ri.lap,
        d.name AS driverName,
        t.name AS teamName,
        ri.description,
        p.type AS penaltyType,
        p.value AS penaltyValue,
        pa.status AS penaltyStatus,
        u.username AS stewardName
    FROM RaceIncident ri
    INNER JOIN Driver d ON ri.driverId = d.id
    INNER JOIN Team t ON d.teamId = t.id
    LEFT JOIN Penalty p ON ri.penaltyId = p.id
    LEFT JOIN PenaltyAssignment pa ON ri.id = pa.incidentId
    LEFT JOIN User u ON pa.stewardId = u.id
    WHERE ri.raceId = p_raceId
    ORDER BY ri.lap;
END$$

DELIMITER ;

-- =====================================================
-- FUNCTIONS
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

-- Verify procedures were created
SHOW PROCEDURE STATUS WHERE Db = 'race_control';

-- Verify functions were created
SHOW FUNCTION STATUS WHERE Db = 'race_control';

-- Test procedure (optional)
-- CALL CalculateChampionshipStandings(1, 'driver');

SELECT 'Setup complete! Procedures and functions created successfully.' AS Status;
