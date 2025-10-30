USE race_control;

-- Drop and recreate the procedure without COMPLETED status requirement
DROP PROCEDURE IF EXISTS CalculateChampionshipStandings;

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

DELIMITER ;

SELECT 'Procedure updated successfully!' AS Status;
