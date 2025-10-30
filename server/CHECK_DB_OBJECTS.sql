USE race_control;

-- Check all stored procedures
SELECT '=== STORED PROCEDURES ===' AS Info;
SELECT 
    ROUTINE_NAME AS ProcedureName,
    ROUTINE_TYPE AS Type,
    CREATED AS CreatedDate
FROM information_schema.ROUTINES
WHERE ROUTINE_SCHEMA = 'race_control' 
AND ROUTINE_TYPE = 'PROCEDURE'
ORDER BY ROUTINE_NAME;

-- Check all functions
SELECT '=== FUNCTIONS ===' AS Info;
SELECT 
    ROUTINE_NAME AS FunctionName,
    ROUTINE_TYPE AS Type,
    CREATED AS CreatedDate
FROM information_schema.ROUTINES
WHERE ROUTINE_SCHEMA = 'race_control' 
AND ROUTINE_TYPE = 'FUNCTION'
ORDER BY ROUTINE_NAME;

-- Check all triggers
SELECT '=== TRIGGERS ===' AS Info;
SELECT 
    TRIGGER_NAME AS TriggerName,
    EVENT_MANIPULATION AS Event,
    EVENT_OBJECT_TABLE AS TableName,
    ACTION_TIMING AS Timing,
    ACTION_STATEMENT AS Action
FROM information_schema.TRIGGERS
WHERE TRIGGER_SCHEMA = 'race_control'
ORDER BY TRIGGER_NAME;

-- Summary count
SELECT '=== SUMMARY ===' AS Info;
SELECT 
    (SELECT COUNT(*) FROM information_schema.ROUTINES WHERE ROUTINE_SCHEMA = 'race_control' AND ROUTINE_TYPE = 'PROCEDURE') AS TotalProcedures,
    (SELECT COUNT(*) FROM information_schema.ROUTINES WHERE ROUTINE_SCHEMA = 'race_control' AND ROUTINE_TYPE = 'FUNCTION') AS TotalFunctions,
    (SELECT COUNT(*) FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA = 'race_control') AS TotalTriggers;
