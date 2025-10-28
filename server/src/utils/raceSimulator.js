/**
 * F1 Race Simulator
 * Generates realistic race logs with lap-by-lap data
 */

// Team performance factors (relative to fastest team)
const TEAM_PERFORMANCE = {
  'Red Bull': 1.000,
  'Ferrari': 0.985,
  'McLaren': 0.980,
  'Mercedes': 0.975,
  'Aston Martin': 0.965,
  'Alpine': 0.955,
  'Williams': 0.945,
  'AlphaTauri': 0.940,
  'Alfa Romeo': 0.935,
  'Haas': 0.930,
};

// Base lap time in seconds (circuit dependent)
const BASE_LAP_TIME = 90; // ~1:30 for average circuit

/**
 * Simulate an entire F1 race
 * @param {Array} drivers - Array of driver objects with team info
 * @param {Object} circuit - Circuit object with laps info
 * @returns {Object} Race simulation results
 */
export function simulateRace(drivers, circuit) {
  if (!drivers || drivers.length === 0) {
    throw new Error('No drivers provided for race simulation');
  }

  // Step 1: Generate qualifying grid
  const grid = generateQualifyingGrid(drivers);

  // Step 2: Initialize race state
  let standings = grid.map((gridPosition, index) => ({
    driver: gridPosition.driver,
    position: index + 1,
    startPosition: index + 1,
    totalTime: 0,
    fastestLap: Infinity,
    fastestLapNumber: 0,
    pitStops: 0,
    penalties: [],
    lapTimes: [],
  }));

  // Step 3: Simulate race lap by lap
  const totalLaps = circuit.laps || 50;
  
  for (let lap = 1; lap <= totalLaps; lap++) {
    standings = simulateLap(standings, lap, totalLaps);
  }

  // Step 4: Format final results
  const results = formatRaceResults(standings, totalLaps);

  return {
    standings: results,
    totalLaps,
    fastestLap: findFastestLap(results),
  };
}

/**
 * Generate qualifying grid positions
 */
function generateQualifyingGrid(drivers) {
  return drivers
    .map(driver => {
      const teamPerformance = TEAM_PERFORMANCE[driver.team.name] || 0.920;
      const driverSkill = 0.98 + Math.random() * 0.04; // Random driver performance
      const qualifyingTime = BASE_LAP_TIME * teamPerformance * driverSkill;

      return {
        driver,
        qualifyingTime,
      };
    })
    .sort((a, b) => a.qualifyingTime - b.qualifyingTime);
}

/**
 * Simulate a single lap for all drivers
 */
function simulateLap(standings, lapNumber, totalLaps) {
  standings.forEach(standing => {
    const teamPerformance = TEAM_PERFORMANCE[standing.driver.team.name] || 0.920;
    
    // Base lap time with team performance
    let lapTime = BASE_LAP_TIME * teamPerformance;
    
    // Add randomness (tire deg, traffic, driver error)
    lapTime += (Math.random() - 0.5) * 2; // ±1 second variation
    
    // Tire degradation (gets slower as race progresses)
    const tireDeg = (lapNumber / totalLaps) * 0.5;
    lapTime += tireDeg;
    
    // Pit stop logic
    if (shouldPitStop(lapNumber, standing.pitStops, totalLaps)) {
      lapTime += 22 + Math.random() * 2; // 22-24 second pit stop
      standing.pitStops++;
    }
    
    // Track fastest lap (usually in first 10 laps or after pit stop)
    if (lapTime < standing.fastestLap) {
      standing.fastestLap = lapTime;
      standing.fastestLapNumber = lapNumber;
    }
    
    standing.totalTime += lapTime;
    standing.lapTimes.push(lapTime);
  });

  // Sort by total time and update positions
  standings.sort((a, b) => a.totalTime - b.totalTime);
  standings.forEach((standing, index) => {
    standing.position = index + 1;
  });

  return standings;
}

/**
 * Determine if driver should pit this lap
 */
function shouldPitStop(lap, currentPitStops, totalLaps) {
  // Most F1 races have 1-2 pit stops
  if (currentPitStops === 0) {
    // First pit stop between lap 15-30
    return lap >= 15 && lap <= 30 && Math.random() > 0.85;
  } else if (currentPitStops === 1) {
    // Second pit stop between lap 40-55 (if race is long enough)
    if (totalLaps > 50) {
      return lap >= 40 && lap <= 55 && Math.random() > 0.90;
    }
  }
  return false;
}

/**
 * Format race results for display
 */
function formatRaceResults(standings, totalLaps) {
  const leader = standings[0];
  const leaderTime = leader.totalTime;

  return standings.map((standing, index) => {
    const gap = standing.totalTime - leaderTime;
    
    return {
      position: index + 1,
      driverId: standing.driver.id,
      driverName: standing.driver.name,
      driverNumber: standing.driver.number,
      teamId: standing.driver.team.id,
      teamName: standing.driver.team.name,
      startPosition: standing.startPosition,
      totalTime: formatTotalTime(standing.totalTime),
      gap: gap === 0 ? '0s' : `+${gap.toFixed(3)}s`,
      fastestLap: formatLapTime(standing.fastestLap),
      fastestLapNumber: standing.fastestLapNumber,
      pitStops: standing.pitStops,
      penalty: '0s', // No penalties initially
      lapsCompleted: totalLaps,
    };
  });
}

/**
 * Find the fastest lap of the race
 */
function findFastestLap(results) {
  const fastest = results.reduce((prev, current) => {
    const prevTime = parseLapTime(prev.fastestLap);
    const currentTime = parseLapTime(current.fastestLap);
    return currentTime < prevTime ? current : prev;
  });

  return {
    driver: fastest.driverName,
    time: fastest.fastestLap,
    lap: fastest.fastestLapNumber,
  };
}

/**
 * Format total race time (MM:SS.mmm)
 */
function formatTotalTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toFixed(3).padStart(6, '0')}`;
}

/**
 * Format lap time (M:SS.mmm)
 */
function formatLapTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toFixed(3).padStart(6, '0')}`;
}

/**
 * Parse lap time string back to seconds
 */
function parseLapTime(timeString) {
  const [minutes, seconds] = timeString.split(':');
  return parseInt(minutes) * 60 + parseFloat(seconds);
}

/**
 * Generate random race incidents (optional)
 */
export function generateRandomIncidents(standings, totalLaps) {
  const incidents = [];
  const incidentTypes = [
    'Collision with another car',
    'Exceeded track limits',
    'Unsafe release from pit box',
    'Causing a collision',
    'Ignoring blue flags',
  ];

  // Generate 2-4 random incidents
  const numIncidents = Math.floor(Math.random() * 3) + 2;

  for (let i = 0; i < numIncidents; i++) {
    const randomDriver = standings[Math.floor(Math.random() * standings.length)];
    const randomLap = Math.floor(Math.random() * totalLaps) + 1;
    const randomType = incidentTypes[Math.floor(Math.random() * incidentTypes.length)];

    incidents.push({
      driverId: randomDriver.driverId,
      driverName: randomDriver.driverName,
      lap: randomLap,
      description: `${randomType} at Turn ${Math.floor(Math.random() * 10) + 1}`,
    });
  }

  return incidents.sort((a, b) => a.lap - b.lap);
}
