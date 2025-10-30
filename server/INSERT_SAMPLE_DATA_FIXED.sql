USE race_control;

-- =====================================================
-- INSERT SAMPLE DATA (WITH TRIGGER WORKAROUND)
-- =====================================================

-- Temporarily drop the triggers that cause conflicts
DROP TRIGGER IF EXISTS after_race_result_insert;
DROP TRIGGER IF EXISTS after_race_result_update;

SELECT '✅ Triggers temporarily disabled' AS Status;

-- Get the latest season
SELECT @seasonId := id FROM Season ORDER BY year DESC LIMIT 1;

-- Get a circuit
SELECT @circuitId := id FROM Circuit LIMIT 1;

-- Create Race 1
DELETE FROM RaceResult WHERE raceId IN (SELECT id FROM Race WHERE name LIKE 'Sample Championship Race%');
DELETE FROM Race WHERE name LIKE 'Sample Championship Race%';

INSERT INTO Race (name, date, circuitId, seasonId, status, createdAt, updatedAt)
VALUES ('Sample Championship Race 1', CURDATE(), @circuitId, @seasonId, 'COMPLETED', NOW(), NOW());

SELECT @raceId := LAST_INSERT_ID();

-- Insert results for Race 1 (manually assign positions)
INSERT INTO RaceResult (raceId, driverId, teamId, position, time, points, fastestLap, penalty, createdAt, updatedAt)
SELECT 
    @raceId,
    d.id,
    d.teamId,
    CASE d.id
        WHEN (SELECT id FROM Driver ORDER BY RAND() LIMIT 1 OFFSET 0) THEN 1
        WHEN (SELECT id FROM Driver ORDER BY RAND() LIMIT 1 OFFSET 1) THEN 2
        WHEN (SELECT id FROM Driver ORDER BY RAND() LIMIT 1 OFFSET 2) THEN 3
        WHEN (SELECT id FROM Driver ORDER BY RAND() LIMIT 1 OFFSET 3) THEN 4
        ELSE 5
    END AS position,
    CONCAT('1:32:', LPAD(d.id * 5, 2, '0'), '.123') AS time,
    CASE 
        WHEN d.id = (SELECT id FROM Driver ORDER BY id LIMIT 1) THEN 25
        WHEN d.id = (SELECT id FROM Driver ORDER BY id LIMIT 1 OFFSET 1) THEN 18
        WHEN d.id = (SELECT id FROM Driver ORDER BY id LIMIT 1 OFFSET 2) THEN 15
        WHEN d.id = (SELECT id FROM Driver ORDER BY id LIMIT 1 OFFSET 3) THEN 12
        ELSE 10
    END AS points,
    IF(d.id = (SELECT id FROM Driver ORDER BY id LIMIT 1), '1:28.456', '') AS fastestLap,
    '0s' AS penalty,
    NOW(),
    NOW()
FROM Driver d
LIMIT 5;

-- Create Race 2
INSERT INTO Race (name, date, circuitId, seasonId, status, createdAt, updatedAt)
VALUES ('Sample Championship Race 2', DATE_ADD(CURDATE(), INTERVAL 7 DAY), @circuitId, @seasonId, 'COMPLETED', NOW(), NOW());

SELECT @raceId2 := LAST_INSERT_ID();

-- Insert results for Race 2
INSERT INTO RaceResult (raceId, driverId, teamId, position, time, points, fastestLap, penalty, createdAt, updatedAt)
SELECT 
    @raceId2,
    d.id,
    d.teamId,
    CASE 
        WHEN d.id = (SELECT id FROM Driver ORDER BY id DESC LIMIT 1) THEN 1
        WHEN d.id = (SELECT id FROM Driver ORDER BY id LIMIT 1) THEN 2
        WHEN d.id = (SELECT id FROM Driver ORDER BY id LIMIT 1 OFFSET 1) THEN 3
        WHEN d.id = (SELECT id FROM Driver ORDER BY id LIMIT 1 OFFSET 2) THEN 4
        ELSE 5
    END AS position,
    CONCAT('1:30:', LPAD(d.id * 6, 2, '0'), '.456') AS time,
    CASE 
        WHEN d.id = (SELECT id FROM Driver ORDER BY id DESC LIMIT 1) THEN 25
        WHEN d.id = (SELECT id FROM Driver ORDER BY id LIMIT 1) THEN 18
        WHEN d.id = (SELECT id FROM Driver ORDER BY id LIMIT 1 OFFSET 1) THEN 15
        WHEN d.id = (SELECT id FROM Driver ORDER BY id LIMIT 1 OFFSET 2) THEN 12
        ELSE 10
    END AS points,
    IF(d.id = (SELECT id FROM Driver ORDER BY id LIMIT 1), '1:27.890', '') AS fastestLap,
    '0s' AS penalty,
    NOW(),
    NOW()
FROM Driver d
LIMIT 5;

-- Create Race 3
INSERT INTO Race (name, date, circuitId, seasonId, status, createdAt, updatedAt)
VALUES ('Sample Championship Race 3', DATE_ADD(CURDATE(), INTERVAL 14 DAY), @circuitId, @seasonId, 'COMPLETED', NOW(), NOW());

SELECT @raceId3 := LAST_INSERT_ID();

-- Insert results for Race 3
INSERT INTO RaceResult (raceId, driverId, teamId, position, time, points, fastestLap, penalty, createdAt, updatedAt)
SELECT 
    @raceId3,
    d.id,
    d.teamId,
    CASE 
        WHEN d.id = (SELECT id FROM Driver ORDER BY id LIMIT 1 OFFSET 2) THEN 1
        WHEN d.id = (SELECT id FROM Driver ORDER BY id DESC LIMIT 1) THEN 2
        WHEN d.id = (SELECT id FROM Driver ORDER BY id LIMIT 1) THEN 3
        WHEN d.id = (SELECT id FROM Driver ORDER BY id LIMIT 1 OFFSET 1) THEN 4
        ELSE 5
    END AS position,
    CONCAT('1:33:', LPAD(d.id * 7, 2, '0'), '.789') AS time,
    CASE 
        WHEN d.id = (SELECT id FROM Driver ORDER BY id LIMIT 1 OFFSET 2) THEN 25
        WHEN d.id = (SELECT id FROM Driver ORDER BY id DESC LIMIT 1) THEN 18
        WHEN d.id = (SELECT id FROM Driver ORDER BY id LIMIT 1) THEN 15
        WHEN d.id = (SELECT id FROM Driver ORDER BY id LIMIT 1 OFFSET 1) THEN 12
        ELSE 10
    END AS points,
    IF(d.id = (SELECT id FROM Driver ORDER BY id LIMIT 1 OFFSET 2), '1:29.123', '') AS fastestLap,
    '0s' AS penalty,
    NOW(),
    NOW()
FROM Driver d
LIMIT 5;

-- Manually update driver points (since triggers are disabled)
UPDATE Driver d
SET points = (
    SELECT COALESCE(SUM(rr.points), 0)
    FROM RaceResult rr
    WHERE rr.driverId = d.id
);

-- Recreate the triggers
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

SELECT '✅ Triggers re-enabled' AS Status;

-- Show results
SELECT '✅ Sample data inserted successfully!' AS Status;

SELECT 'Total Race Results:' AS Info;
SELECT COUNT(*) AS total_results FROM RaceResult;

SELECT 'Top 5 Drivers:' AS Info;
SELECT 
    d.name AS driverName,
    t.name AS teamName,
    d.points AS totalPoints,
    COUNT(rr.id) AS racesParticipated
FROM Driver d
INNER JOIN Team t ON d.teamId = t.id
LEFT JOIN RaceResult rr ON d.id = rr.driverId
GROUP BY d.id, d.name, t.name, d.points
ORDER BY d.points DESC
LIMIT 5;

SELECT 'Top 3 Teams:' AS Info;
SELECT 
    t.name AS teamName,
    SUM(rr.points) AS totalPoints,
    COUNT(DISTINCT rr.raceId) AS racesParticipated
FROM Team t
INNER JOIN RaceResult rr ON t.id = rr.teamId
GROUP BY t.id, t.name
ORDER BY totalPoints DESC
LIMIT 3;
