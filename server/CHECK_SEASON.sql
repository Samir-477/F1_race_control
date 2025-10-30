-- Check which season race 20 belongs to
USE race_control;

SELECT 
    r.id as raceId,
    r.name as raceName,
    r.seasonId,
    s.year,
    s.name as seasonName
FROM Race r
JOIN Season s ON r.seasonId = s.id
WHERE r.id = 20;

-- Check all seasons
SELECT * FROM Season ORDER BY year DESC;

-- Test stored procedure with correct season ID
SELECT 'Testing with correct season ID' as Info;
SELECT seasonId FROM Race WHERE id = 20 INTO @correctSeasonId;
SELECT CONCAT('Calling procedure with season ID: ', @correctSeasonId) as Info;
