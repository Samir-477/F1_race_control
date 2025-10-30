USE race_control;

-- =====================================================
-- SIMPLE SAMPLE DATA INSERT
-- =====================================================

-- First, let's see what we have
SELECT 'Checking existing data...' AS Status;

SELECT COUNT(*) AS team_count FROM Team;
SELECT COUNT(*) AS driver_count FROM Driver;
SELECT COUNT(*) AS season_count FROM Season;
SELECT COUNT(*) AS circuit_count FROM Circuit;

-- Show all drivers with their teams
SELECT 
    d.id AS driverId,
    d.name AS driverName,
    d.teamId,
    t.name AS teamName
FROM Driver d
LEFT JOIN Team t ON d.teamId = t.id
ORDER BY d.id;

-- Get the latest season
SELECT @seasonId := id FROM Season ORDER BY year DESC LIMIT 1;
SELECT CONCAT('Using Season ID: ', @seasonId) AS Info;

-- Get a circuit
SELECT @circuitId := id FROM Circuit LIMIT 1;
SELECT CONCAT('Using Circuit ID: ', @circuitId) AS Info;

-- Create a sample race
DELETE FROM Race WHERE name = 'Sample Championship Race 1';

INSERT INTO Race (name, date, circuitId, seasonId, status, createdAt, updatedAt)
VALUES ('Sample Championship Race 1', CURDATE(), @circuitId, @seasonId, 'COMPLETED', NOW(), NOW());

SELECT @raceId := LAST_INSERT_ID();
SELECT CONCAT('Created Race ID: ', @raceId) AS Info;

-- Now insert results using actual driver IDs from the database
-- Get all drivers and insert results for them
INSERT INTO RaceResult (raceId, driverId, teamId, position, time, points, fastestLap, penalty, createdAt, updatedAt)
SELECT 
    @raceId,
    d.id,
    d.teamId,
    @rownum := @rownum + 1 AS position,
    CONCAT('1:32:', LPAD(@rownum * 5, 2, '0'), '.', LPAD(FLOOR(RAND() * 1000), 3, '0')) AS time,
    CASE @rownum
        WHEN 1 THEN 25
        WHEN 2 THEN 18
        WHEN 3 THEN 15
        WHEN 4 THEN 12
        WHEN 5 THEN 10
        WHEN 6 THEN 8
        WHEN 7 THEN 6
        WHEN 8 THEN 4
        WHEN 9 THEN 2
        WHEN 10 THEN 1
        ELSE 0
    END AS points,
    IF(@rownum = 1, '1:28.456', '') AS fastestLap,
    '0s' AS penalty,
    NOW(),
    NOW()
FROM Driver d
CROSS JOIN (SELECT @rownum := 0) r
ORDER BY RAND()
LIMIT 10;

-- Create Race 2
DELETE FROM Race WHERE name = 'Sample Championship Race 2';

INSERT INTO Race (name, date, circuitId, seasonId, status, createdAt, updatedAt)
VALUES ('Sample Championship Race 2', DATE_ADD(CURDATE(), INTERVAL 7 DAY), @circuitId, @seasonId, 'COMPLETED', NOW(), NOW());

SELECT @raceId2 := LAST_INSERT_ID();

-- Insert results for Race 2
INSERT INTO RaceResult (raceId, driverId, teamId, position, time, points, fastestLap, penalty, createdAt, updatedAt)
SELECT 
    @raceId2,
    d.id,
    d.teamId,
    @rownum2 := @rownum2 + 1 AS position,
    CONCAT('1:30:', LPAD(@rownum2 * 5, 2, '0'), '.', LPAD(FLOOR(RAND() * 1000), 3, '0')) AS time,
    CASE @rownum2
        WHEN 1 THEN 25
        WHEN 2 THEN 18
        WHEN 3 THEN 15
        WHEN 4 THEN 12
        WHEN 5 THEN 10
        WHEN 6 THEN 8
        WHEN 7 THEN 6
        WHEN 8 THEN 4
        WHEN 9 THEN 2
        WHEN 10 THEN 1
        ELSE 0
    END AS points,
    IF(@rownum2 = 2, '1:27.890', '') AS fastestLap,
    '0s' AS penalty,
    NOW(),
    NOW()
FROM Driver d
CROSS JOIN (SELECT @rownum2 := 0) r
ORDER BY RAND()
LIMIT 10;

-- Create Race 3
DELETE FROM Race WHERE name = 'Sample Championship Race 3';

INSERT INTO Race (name, date, circuitId, seasonId, status, createdAt, updatedAt)
VALUES ('Sample Championship Race 3', DATE_ADD(CURDATE(), INTERVAL 14 DAY), @circuitId, @seasonId, 'COMPLETED', NOW(), NOW());

SELECT @raceId3 := LAST_INSERT_ID();

-- Insert results for Race 3
INSERT INTO RaceResult (raceId, driverId, teamId, position, time, points, fastestLap, penalty, createdAt, updatedAt)
SELECT 
    @raceId3,
    d.id,
    d.teamId,
    @rownum3 := @rownum3 + 1 AS position,
    CONCAT('1:33:', LPAD(@rownum3 * 5, 2, '0'), '.', LPAD(FLOOR(RAND() * 1000), 3, '0')) AS time,
    CASE @rownum3
        WHEN 1 THEN 25
        WHEN 2 THEN 18
        WHEN 3 THEN 15
        WHEN 4 THEN 12
        WHEN 5 THEN 10
        WHEN 6 THEN 8
        WHEN 7 THEN 6
        WHEN 8 THEN 4
        WHEN 9 THEN 2
        WHEN 10 THEN 1
        ELSE 0
    END AS points,
    IF(@rownum3 = 3, '1:29.123', '') AS fastestLap,
    '0s' AS penalty,
    NOW(),
    NOW()
FROM Driver d
CROSS JOIN (SELECT @rownum3 := 0) r
ORDER BY RAND()
LIMIT 10;

-- Update driver points
UPDATE Driver d
SET points = (
    SELECT COALESCE(SUM(rr.points), 0)
    FROM RaceResult rr
    WHERE rr.driverId = d.id
);

-- Show results
SELECT '✅ Sample data inserted successfully!' AS Status;

SELECT 'Total Race Results:' AS Info;
SELECT COUNT(*) AS total_results FROM RaceResult;

SELECT 'Top 5 Drivers:' AS Info;
SELECT 
    d.name AS driverName,
    t.name AS teamName,
    d.points AS totalPoints
FROM Driver d
INNER JOIN Team t ON d.teamId = t.id
ORDER BY d.points DESC
LIMIT 5;

SELECT 'Top 3 Teams:' AS Info;
SELECT 
    t.name AS teamName,
    SUM(rr.points) AS totalPoints
FROM Team t
INNER JOIN RaceResult rr ON t.id = rr.teamId
GROUP BY t.id, t.name
ORDER BY totalPoints DESC
LIMIT 3;
