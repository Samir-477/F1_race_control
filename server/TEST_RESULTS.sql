-- Test if race results were created
USE race_control;

-- Check if we have any race results
SELECT 'Race Results Count' as Info, COUNT(*) as Count FROM RaceResult;

-- Check race results details
SELECT 
    rr.id,
    rr.raceId,
    rr.position,
    rr.points,
    d.name as driverName,
    t.name as teamName
FROM RaceResult rr
JOIN Driver d ON rr.driverId = d.id
JOIN Team t ON rr.teamId = t.id
ORDER BY rr.raceId, rr.position;

-- Check if stored procedure exists
SELECT 'Stored Procedure Check' as Info;
SHOW PROCEDURE STATUS WHERE Name = 'CalculateChampionshipStandings';

-- Test the stored procedure manually
SELECT 'Testing Stored Procedure' as Info;
CALL CalculateChampionshipStandings(2, 'driver');
