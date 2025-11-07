import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function createFunction() {
  console.log('Creating GetDriverPerformanceRating function...');
  
  try {
    // Drop existing function if it exists
    await prisma.$executeRawUnsafe(`DROP FUNCTION IF EXISTS GetDriverPerformanceRating`);
    console.log('Dropped existing function (if any)');
    
    // Create the function
    const createFunctionSQL = `
CREATE FUNCTION GetDriverPerformanceRating(
    p_driverId INT,
    p_seasonId INT
)
RETURNS DECIMAL(5,2)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE totalRaces INT;
    DECLARE avgPosition DECIMAL(5,2);
    DECLARE totalPoints DECIMAL(10,2);
    DECLARE wins INT;
    DECLARE podiums INT;
    DECLARE incidents INT;
    DECLARE rating DECIMAL(5,2);
    
    SELECT 
        COUNT(*) INTO totalRaces
    FROM RaceResult rr
    INNER JOIN Race r ON rr.raceId = r.id
    WHERE rr.driverId = p_driverId AND r.seasonId = p_seasonId;
    
    IF totalRaces = 0 THEN
        RETURN 0;
    END IF;
    
    SELECT 
        AVG(rr.position),
        SUM(rr.points),
        COUNT(CASE WHEN rr.position = 1 THEN 1 END),
        COUNT(CASE WHEN rr.position <= 3 THEN 1 END)
    INTO avgPosition, totalPoints, wins, podiums
    FROM RaceResult rr
    INNER JOIN Race r ON rr.raceId = r.id
    WHERE rr.driverId = p_driverId AND r.seasonId = p_seasonId;
    
    SELECT COUNT(*) INTO incidents
    FROM RaceIncident ri
    INNER JOIN Race r ON ri.raceId = r.id
    WHERE ri.driverId = p_driverId AND r.seasonId = p_seasonId;
    
    SET rating = (totalPoints * 2) + (wins * 10) + (podiums * 5) - (avgPosition * 2) - (incidents * 3);
    
    IF rating < 0 THEN
        SET rating = 0;
    ELSEIF rating > 100 THEN
        SET rating = 100;
    END IF;
    
    RETURN rating;
END`;

    await prisma.$executeRawUnsafe(createFunctionSQL);
    console.log('✅ GetDriverPerformanceRating function created successfully!');
    
    // Verify function exists
    const result = await prisma.$queryRawUnsafe(`
      SELECT ROUTINE_NAME 
      FROM information_schema.ROUTINES 
      WHERE ROUTINE_SCHEMA = DATABASE() 
      AND ROUTINE_NAME = 'GetDriverPerformanceRating'
      AND ROUTINE_TYPE = 'FUNCTION'
    `);
    
    if (result.length > 0) {
      console.log('✅ Function verified in database');
    } else {
      console.log('⚠️  Function not found after creation');
    }
    
  } catch (error) {
    console.error('❌ Error creating function:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createFunction();
