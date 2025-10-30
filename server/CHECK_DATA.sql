USE race_control;

-- Check if we have any data
SELECT 'Checking database for race results...' AS Status;

-- Check teams
SELECT COUNT(*) AS total_teams FROM Team;

-- Check drivers
SELECT COUNT(*) AS total_drivers FROM Driver;

-- Check seasons
SELECT COUNT(*) AS total_seasons FROM Season;

-- Check races
SELECT COUNT(*) AS total_races FROM Race;

-- Check race results (THIS IS KEY)
SELECT COUNT(*) AS total_race_results FROM RaceResult;

-- Show what seasons we have
SELECT id, year, name, isActive FROM Season;

-- Show races for each season
SELECT 
    s.year,
    s.name AS seasonName,
    COUNT(r.id) AS raceCount
FROM Season s
LEFT JOIN Race r ON s.id = r.seasonId
GROUP BY s.id, s.year, s.name;

-- Show race results count per season
SELECT 
    s.year,
    s.name AS seasonName,
    COUNT(rr.id) AS resultCount,
    SUM(rr.points) AS totalPoints
FROM Season s
LEFT JOIN Race r ON s.id = r.seasonId
LEFT JOIN RaceResult rr ON r.id = rr.raceId
GROUP BY s.id, s.year, s.name;

-- If we have results, show top 5 drivers by points
SELECT 
    d.name AS driverName,
    t.name AS teamName,
    SUM(rr.points) AS totalPoints
FROM Driver d
INNER JOIN Team t ON d.teamId = t.id
LEFT JOIN RaceResult rr ON d.id = rr.driverId
GROUP BY d.id, d.name, t.name
ORDER BY totalPoints DESC
LIMIT 5;
