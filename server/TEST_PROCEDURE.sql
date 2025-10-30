USE race_control;

-- Test the stored procedure directly
CALL CalculateChampionshipStandings(2, 'driver');

-- Check if we have any race results for season 2
SELECT 'Race Results for Season 2:' AS Info;
SELECT 
    r.id AS raceId,
    r.name AS raceName,
    COUNT(rr.id) AS resultCount
FROM Race r
LEFT JOIN RaceResult rr ON r.id = rr.raceId
WHERE r.seasonId = 2
GROUP BY r.id, r.name;

-- Check driver points
SELECT 'Driver Points:' AS Info;
SELECT 
    d.id,
    d.name,
    d.points,
    t.name AS teamName
FROM Driver d
INNER JOIN Team t ON d.teamId = t.id
ORDER BY d.points DESC;
