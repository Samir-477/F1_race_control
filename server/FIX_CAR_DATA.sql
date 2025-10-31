USE race_control;

-- Check current car data
SELECT 'Current Car Data:' AS Status;
SELECT c.id, c.teamId, c.model, LEFT(c.chassis, 50) AS chassis_preview, c.engine
FROM Car c
INNER JOIN Team t ON c.teamId = t.id;

-- Fix car data with proper values
UPDATE Car c
INNER JOIN Team t ON c.teamId = t.id
SET 
    c.chassis = CASE t.name
        WHEN 'Ferrari' THEN 'SF-24'
        WHEN 'Mercedes' THEN 'W15'
        WHEN 'Red Bull Racing' THEN 'RB20'
        WHEN 'McLaren' THEN 'MCL38'
        WHEN 'Aston Martin' THEN 'AMR24'
        WHEN 'Alpine' THEN 'A524'
        WHEN 'Williams' THEN 'FW46'
        WHEN 'AlphaTauri' THEN 'AT05'
        WHEN 'Alfa Romeo' THEN 'C44'
        WHEN 'Haas' THEN 'VF-24'
        ELSE CONCAT(t.name, ' Chassis')
    END,
    c.model = CASE t.name
        WHEN 'Ferrari' THEN 'Ferrari'
        WHEN 'Mercedes' THEN 'Mercedes'
        WHEN 'Red Bull Racing' THEN 'Red Bull'
        WHEN 'McLaren' THEN 'McLaren'
        WHEN 'Aston Martin' THEN 'Aston Martin'
        WHEN 'Alpine' THEN 'Alpine'
        WHEN 'Williams' THEN 'Williams'
        WHEN 'AlphaTauri' THEN 'AlphaTauri'
        WHEN 'Alfa Romeo' THEN 'Alfa Romeo'
        WHEN 'Haas' THEN 'Haas'
        ELSE t.name
    END,
    c.engine = CASE t.name
        WHEN 'Ferrari' THEN 'Scuderia Ferrari HP'
        WHEN 'Mercedes' THEN 'Mercedes-AMG Petronas'
        WHEN 'Red Bull Racing' THEN 'Red Bull Powertrains'
        WHEN 'McLaren' THEN 'Mercedes'
        WHEN 'Aston Martin' THEN 'Mercedes'
        WHEN 'Alpine' THEN 'Renault'
        WHEN 'Williams' THEN 'Mercedes'
        WHEN 'AlphaTauri' THEN 'Red Bull Powertrains'
        WHEN 'Alfa Romeo' THEN 'Ferrari'
        WHEN 'Haas' THEN 'Ferrari'
        ELSE CONCAT(t.name, ' Engine')
    END
WHERE LENGTH(c.chassis) > 100;  -- Only update if chassis is suspiciously long

-- Show updated data
SELECT 'Updated Car Data:' AS Status;
SELECT c.id, c.teamId, t.name AS teamName, c.model, c.chassis, c.engine
FROM Car c
INNER JOIN Team t ON c.teamId = t.id;
