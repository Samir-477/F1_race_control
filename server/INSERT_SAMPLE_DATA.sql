USE race_control;

-- =====================================================
-- INSERT SAMPLE RACE RESULTS DATA
-- =====================================================

SET @seasonId = (SELECT id FROM Season ORDER BY year DESC LIMIT 1);
SET @raceId = (SELECT id FROM Race WHERE seasonId = @seasonId LIMIT 1);

-- If no race exists, we need to create one first
-- Get circuit and season IDs
SET @circuitId = (SELECT id FROM Circuit LIMIT 1);

-- Create a sample race if none exists
INSERT INTO Race (name, date, circuitId, seasonId, status, createdAt, updatedAt)
SELECT 
    'Sample Grand Prix',
    CURDATE(),
    @circuitId,
    @seasonId,
    'COMPLETED',
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM Race WHERE seasonId = @seasonId LIMIT 1);

-- Get the race ID (either existing or newly created)
SET @raceId = (SELECT id FROM Race WHERE seasonId = @seasonId LIMIT 1);

-- Get team and driver IDs
SET @team1 = (SELECT id FROM Team ORDER BY id LIMIT 1);
SET @team2 = (SELECT id FROM Team ORDER BY id LIMIT 1 OFFSET 1);
SET @team3 = (SELECT id FROM Team ORDER BY id LIMIT 1 OFFSET 2);
SET @team4 = (SELECT id FROM Team ORDER BY id LIMIT 1 OFFSET 3);
SET @team5 = (SELECT id FROM Team ORDER BY id LIMIT 1 OFFSET 4);

-- Get drivers
SET @driver1 = (SELECT id FROM Driver WHERE teamId = @team1 LIMIT 1);
SET @driver2 = (SELECT id FROM Driver WHERE teamId = @team1 LIMIT 1 OFFSET 1);
SET @driver3 = (SELECT id FROM Driver WHERE teamId = @team2 LIMIT 1);
SET @driver4 = (SELECT id FROM Driver WHERE teamId = @team2 LIMIT 1 OFFSET 1);
SET @driver5 = (SELECT id FROM Driver WHERE teamId = @team3 LIMIT 1);
SET @driver6 = (SELECT id FROM Driver WHERE teamId = @team3 LIMIT 1 OFFSET 1);
SET @driver7 = (SELECT id FROM Driver WHERE teamId = @team4 LIMIT 1);
SET @driver8 = (SELECT id FROM Driver WHERE teamId = @team4 LIMIT 1 OFFSET 1);
SET @driver9 = (SELECT id FROM Driver WHERE teamId = @team5 LIMIT 1);
SET @driver10 = (SELECT id FROM Driver WHERE teamId = @team5 LIMIT 1 OFFSET 1);

-- Delete existing results for this race to avoid duplicates
DELETE FROM RaceResult WHERE raceId = @raceId;

-- Insert Race Results for Race 1
-- Position 1-10 with F1 points system: 25, 18, 15, 12, 10, 8, 6, 4, 2, 1

INSERT INTO RaceResult (raceId, driverId, teamId, position, time, points, fastestLap, penalty, createdAt, updatedAt)
VALUES
    (@raceId, @driver1, @team1, 1, '1:32:15.123', 25, '1:28.456', '0s', NOW(), NOW()),
    (@raceId, @driver3, @team2, 2, '1:32:18.456', 18, '', '0s', NOW(), NOW()),
    (@raceId, @driver5, @team3, 3, '1:32:22.789', 15, '', '0s', NOW(), NOW()),
    (@raceId, @driver2, @team1, 4, '1:32:28.012', 12, '', '0s', NOW(), NOW()),
    (@raceId, @driver7, @team4, 5, '1:32:35.345', 10, '', '0s', NOW(), NOW()),
    (@raceId, @driver4, @team2, 6, '1:32:42.678', 8, '', '0s', NOW(), NOW()),
    (@raceId, @driver9, @team5, 7, '1:32:50.901', 6, '', '0s', NOW(), NOW()),
    (@raceId, @driver6, @team3, 8, '1:32:58.234', 4, '', '0s', NOW(), NOW()),
    (@raceId, @driver8, @team4, 9, '1:33:05.567', 2, '', '0s', NOW(), NOW()),
    (@raceId, @driver10, @team5, 10, '1:33:12.890', 1, '', '0s', NOW(), NOW());

-- Create Race 2
INSERT INTO Race (name, date, circuitId, seasonId, status, createdAt, updatedAt)
SELECT 
    'Second Grand Prix',
    DATE_ADD(CURDATE(), INTERVAL 14 DAY),
    (SELECT id FROM Circuit LIMIT 1 OFFSET 1),
    @seasonId,
    'COMPLETED',
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM Race WHERE name = 'Second Grand Prix' AND seasonId = @seasonId);

SET @raceId2 = (SELECT id FROM Race WHERE name = 'Second Grand Prix' AND seasonId = @seasonId LIMIT 1);

-- Insert Race Results for Race 2 (different winners)
INSERT INTO RaceResult (raceId, driverId, teamId, position, time, points, fastestLap, penalty, createdAt, updatedAt)
VALUES
    (@raceId2, @driver3, @team2, 1, '1:28:45.123', 25, '', '0s', NOW(), NOW()),
    (@raceId2, @driver1, @team1, 2, '1:28:48.456', 18, '1:27.890', '0s', NOW(), NOW()),
    (@raceId2, @driver7, @team4, 3, '1:28:52.789', 15, '', '0s', NOW(), NOW()),
    (@raceId2, @driver5, @team3, 4, '1:28:58.012', 12, '', '0s', NOW(), NOW()),
    (@raceId2, @driver2, @team1, 5, '1:29:05.345', 10, '', '0s', NOW(), NOW()),
    (@raceId2, @driver9, @team5, 6, '1:29:12.678', 8, '', '0s', NOW(), NOW()),
    (@raceId2, @driver4, @team2, 7, '1:29:20.901', 6, '', '0s', NOW(), NOW()),
    (@raceId2, @driver6, @team3, 8, '1:29:28.234', 4, '', '0s', NOW(), NOW()),
    (@raceId2, @driver10, @team5, 9, '1:29:35.567', 2, '', '0s', NOW(), NOW()),
    (@raceId2, @driver8, @team4, 10, '1:29:42.890', 1, '', '0s', NOW(), NOW());

-- Create Race 3
INSERT INTO Race (name, date, circuitId, seasonId, status, createdAt, updatedAt)
SELECT 
    'Third Grand Prix',
    DATE_ADD(CURDATE(), INTERVAL 28 DAY),
    (SELECT id FROM Circuit LIMIT 1 OFFSET 2),
    @seasonId,
    'COMPLETED',
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM Race WHERE name = 'Third Grand Prix' AND seasonId = @seasonId);

SET @raceId3 = (SELECT id FROM Race WHERE name = 'Third Grand Prix' AND seasonId = @seasonId LIMIT 1);

-- Insert Race Results for Race 3
INSERT INTO RaceResult (raceId, driverId, teamId, position, time, points, fastestLap, penalty, createdAt, updatedAt)
VALUES
    (@raceId3, @driver5, @team3, 1, '1:35:20.123', 25, '1:29.123', '0s', NOW(), NOW()),
    (@raceId3, @driver7, @team4, 2, '1:35:23.456', 18, '', '0s', NOW(), NOW()),
    (@raceId3, @driver1, @team1, 3, '1:35:27.789', 15, '', '0s', NOW(), NOW()),
    (@raceId3, @driver3, @team2, 4, '1:35:33.012', 12, '', '0s', NOW(), NOW()),
    (@raceId3, @driver9, @team5, 5, '1:35:40.345', 10, '', '0s', NOW(), NOW()),
    (@raceId3, @driver2, @team1, 6, '1:35:47.678', 8, '', '0s', NOW(), NOW()),
    (@raceId3, @driver4, @team2, 7, '1:35:55.901', 6, '', '0s', NOW(), NOW()),
    (@raceId3, @driver8, @team4, 8, '1:36:03.234', 4, '', '0s', NOW(), NOW()),
    (@raceId3, @driver6, @team3, 9, '1:36:10.567', 2, '', '0s', NOW(), NOW()),
    (@raceId3, @driver10, @team5, 10, '1:36:17.890', 1, '', '0s', NOW(), NOW());

-- Update driver points based on race results (triggers should do this, but let's ensure)
UPDATE Driver d
SET points = (
    SELECT COALESCE(SUM(rr.points), 0)
    FROM RaceResult rr
    WHERE rr.driverId = d.id
);

-- Verify the data
SELECT '✅ Sample data inserted successfully!' AS Status;

SELECT 'Race Results Summary:' AS Info;
SELECT 
    r.name AS raceName,
    COUNT(rr.id) AS totalResults,
    SUM(rr.points) AS totalPoints
FROM Race r
LEFT JOIN RaceResult rr ON r.id = rr.raceId
WHERE r.seasonId = @seasonId
GROUP BY r.id, r.name;

SELECT 'Top 5 Drivers by Points:' AS Info;
SELECT 
    d.name AS driverName,
    t.name AS teamName,
    d.points AS totalPoints
FROM Driver d
INNER JOIN Team t ON d.teamId = t.id
ORDER BY d.points DESC
LIMIT 5;

SELECT 'Top 3 Teams by Points:' AS Info;
SELECT 
    t.name AS teamName,
    SUM(rr.points) AS totalPoints
FROM Team t
INNER JOIN RaceResult rr ON t.id = rr.teamId
GROUP BY t.id, t.name
ORDER BY totalPoints DESC
LIMIT 3;
