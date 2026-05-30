// ─── Teams ────────────────────────────────────────────────────────────────────
export const TEAMS = [
  {
    id: 1, name: 'Red Bull', fullName: 'Oracle Red Bull Racing',
    description: 'Dominant force in modern Formula 1, with multiple constructors and drivers titles.',
    base: 'Milton Keynes, UK', teamChief: 'Christian Horner', color: '#FF0000',
    car: { id: 1, model: 'RB21', engine: '1.6 L V6 Hybrid Turbo', chassis: 'Carbon-fibre composite monocoque', teamId: 1 },
    drivers: [
      { id: 1, name: 'Max Verstappen', number: 3, nationality: 'Dutch', podiums: 0, points: 14, worldChampionships: 0, imageUrl: '', teamId: 1 },
      { id: 2, name: 'Isack Hadjar',   number: 2, nationality: 'French', podiums: 0, points: 10, worldChampionships: 0, imageUrl: '', teamId: 1 },
    ],
    sponsors: [{ id: 1, name: 'Oracle' }, { id: 2, name: 'Ford Motor Company' }, { id: 3, name: 'Visa' }],
  },
  {
    id: 2, name: 'McLaren', fullName: 'Google McLaren',
    description: 'Historic British constructor with a storied legacy and a modern renaissance.',
    base: 'Woking, Surrey, UK', teamChief: 'Andrea Stella', color: '#ff9500',
    car: { id: 2, model: 'MCL40', engine: 'Mercedes-AMG F1 E Performance', chassis: 'Carbon-fibre composite monocoque', teamId: 2 },
    drivers: [
      { id: 3, name: 'Lando Norris', number: 1,  nationality: 'British',    podiums: 0, points: 27, worldChampionships: 0, imageUrl: '', teamId: 2 },
      { id: 4, name: 'Oscar Piastri', number: 81, nationality: 'Australian', podiums: 0, points: 30, worldChampionships: 0, imageUrl: '', teamId: 2 },
    ],
    sponsors: [{ id: 4, name: 'Google' }, { id: 5, name: 'Mastercard' }, { id: 6, name: 'OKX' }],
  },
  {
    id: 3, name: 'Ferrari', fullName: 'HP Ferrari',
    description: 'The most iconic team in Formula 1 history, synonymous with passion and speed.',
    base: 'Maranello, Italy', teamChief: 'Frédéric Vasseur', color: '#7a0505',
    car: { id: 3, model: 'SF-26', engine: 'Ferrari 066/15 1.6L V6 Turbo Hybrid', chassis: 'Carbon-fibre composite monocoque', teamId: 3 },
    drivers: [
      { id: 5, name: 'Lewis Hamilton', number: 44, nationality: 'British',    podiums: 0, points: 18, worldChampionships: 0, imageUrl: '', teamId: 3 },
      { id: 6, name: 'Charles Leclerc', number: 16, nationality: 'Monegasque', podiums: 0, points: 18, worldChampionships: 0, imageUrl: '', teamId: 3 },
    ],
    sponsors: [{ id: 7, name: 'HP' }, { id: 8, name: 'IBM' }, { id: 9, name: 'PUMA' }, { id: 10, name: 'Shell' }],
  },
  {
    id: 4, name: 'Mercedes', fullName: 'Mercedes-AMG Petronas',
    description: 'The Silver Arrows — dominant constructors champion, driven by innovation.',
    base: 'Brackley, United Kingdom', teamChief: 'Toto Wolff', color: '#00D2BE',
    car: { id: 4, model: 'W17', engine: 'Mercedes-AMG 1.6L V6 Turbo Hybrid', chassis: 'Carbon-fibre Composite Monocoque', teamId: 4 },
    drivers: [
      { id: 7, name: 'George Russell',        number: 63, nationality: 'British', podiums: 0, points: 43, worldChampionships: 0, imageUrl: '', teamId: 4 },
      { id: 8, name: 'Andrea Kimi Antonelli', number: 12, nationality: 'Italian', podiums: 0, points: 43, worldChampionships: 0, imageUrl: '', teamId: 4 },
    ],
    sponsors: [{ id: 11, name: 'Petronas' }, { id: 12, name: 'INEOS' }, { id: 13, name: 'AMD' }, { id: 14, name: 'Qualcomm' }],
  },
];

// ─── Circuits ─────────────────────────────────────────────────────────────────
export const CIRCUITS = [
  { id: 1, name: 'Monaco Grand Prix',             location: 'Monte Carlo', country: 'Monaco',         length: 3.337, laps: 78 },
  { id: 2, name: 'Silverstone Circuit',           location: 'Silverstone', country: 'United Kingdom', length: 5.891, laps: 52 },
  { id: 3, name: 'Spa-Francorchamps',             location: 'Spa',         country: 'Belgium',         length: 7.004, laps: 44 },
  { id: 4, name: 'Monza Circuit',                 location: 'Monza',       country: 'Italy',           length: 5.793, laps: 53 },
  { id: 5, name: 'Suzuka Circuit',                location: 'Suzuka',      country: 'Japan',           length: 5.807, laps: 53 },
  { id: 6, name: 'Interlagos Circuit',            location: 'São Paulo',   country: 'Brazil',          length: 4.309, laps: 71 },
  { id: 7, name: 'Circuit of the Americas',       location: 'Austin',      country: 'United States',   length: 5.513, laps: 56 },
  { id: 8, name: 'Red Bull Ring',                 location: 'Spielberg',   country: 'Austria',         length: 4.318, laps: 71 },
  { id: 9, name: 'Hungaroring',                   location: 'Budapest',    country: 'Hungary',         length: 4.381, laps: 70 },
  { id: 10, name: 'Bahrain International Circuit', location: 'Sakhir',     country: 'Bahrain',         length: 5.412, laps: 57 },
];

// ─── Seasons ──────────────────────────────────────────────────────────────────
export const SEASONS = [
  { id: 1, year: 2023, name: '2023 Formula 1 World Championship', isActive: false },
  { id: 2, year: 2024, name: '2024 Formula 1 World Championship', isActive: false },
  { id: 3, year: 2025, name: '2025 Formula 1 World Championship', isActive: true  },
];

// ─── Races ────────────────────────────────────────────────────────────────────
export const RACES = [
  {
    id: 1, name: 'Monaco Grand Prix', date: '2025-08-29T00:00:00.000Z',
    status: 'COMPLETED', isReviewed: true,
    circuitId: 1, seasonId: 3,
    circuit: CIRCUITS[0],
    season: SEASONS[2],
    participations: [
      { id: 1, raceId: 1, teamId: 1, team: TEAMS[0] },
      { id: 2, raceId: 1, teamId: 2, team: TEAMS[1] },
      { id: 3, raceId: 1, teamId: 3, team: TEAMS[2] },
      { id: 4, raceId: 1, teamId: 4, team: TEAMS[3] },
    ],
    logs: [{ id: 1 }],
  },
  {
    id: 2, name: 'Japanese Grand Prix', date: '2025-12-07T00:00:00.000Z',
    status: 'COMPLETED', isReviewed: true,
    circuitId: 5, seasonId: 3,
    circuit: CIRCUITS[4],
    season: SEASONS[2],
    participations: [
      { id: 5, raceId: 2, teamId: 1, team: TEAMS[0] },
      { id: 6, raceId: 2, teamId: 2, team: TEAMS[1] },
      { id: 7, raceId: 2, teamId: 3, team: TEAMS[2] },
      { id: 8, raceId: 2, teamId: 4, team: TEAMS[3] },
    ],
    logs: [{ id: 2 }],
  },
];

// ─── Race Results ─────────────────────────────────────────────────────────────
export const RACE_RESULTS: Record<number, any[]> = {
  1: [
    { id: 1,  raceId: 1, position: 1, time: '1:48:43.926', points: 25, penalty: '0s', fastestLap: '', driver: { id: 7, name: 'George Russell',        number: 63 }, team: { id: 4, name: 'Mercedes', color: '#00D2BE' } },
    { id: 2,  raceId: 1, position: 2, time: '+9.333s',     points: 18, penalty: '0s', fastestLap: '', driver: { id: 8, name: 'Andrea Kimi Antonelli', number: 12 }, team: { id: 4, name: 'Mercedes', color: '#00D2BE' } },
    { id: 3,  raceId: 1, position: 3, time: '+21.324s',    points: 15, penalty: '0s', fastestLap: '', driver: { id: 4, name: 'Oscar Piastri',         number: 81 }, team: { id: 2, name: 'McLaren',  color: '#ff9500' } },
    { id: 4,  raceId: 1, position: 4, time: '+35.970s',    points: 12, penalty: '0s', fastestLap: '', driver: { id: 3, name: 'Lando Norris',          number: 1  }, team: { id: 2, name: 'McLaren',  color: '#ff9500' } },
    { id: 5,  raceId: 1, position: 5, time: '+48.373s',    points: 10, penalty: '0s', fastestLap: '', driver: { id: 6, name: 'Charles Leclerc',       number: 16 }, team: { id: 3, name: 'Ferrari',  color: '#7a0505' } },
    { id: 6,  raceId: 1, position: 6, time: '+52.107s',    points: 8,  penalty: '0s', fastestLap: '', driver: { id: 5, name: 'Lewis Hamilton',        number: 44 }, team: { id: 3, name: 'Ferrari',  color: '#7a0505' } },
    { id: 7,  raceId: 1, position: 7, time: '+1:06.273s',  points: 6,  penalty: '5s', fastestLap: '', driver: { id: 1, name: 'Max Verstappen',        number: 3  }, team: { id: 1, name: 'Red Bull', color: '#FF0000' } },
    { id: 8,  raceId: 1, position: 8, time: '+1:41.571s',  points: 4,  penalty: '0s', fastestLap: '', driver: { id: 2, name: 'Isack Hadjar',          number: 2  }, team: { id: 1, name: 'Red Bull', color: '#FF0000' } },
  ],
  2: [
    { id: 9,  raceId: 2, position: 1, time: '1:13:19.495', points: 25, penalty: '2s', fastestLap: '', driver: { id: 8, name: 'Andrea Kimi Antonelli', number: 12 }, team: { id: 4, name: 'Mercedes', color: '#00D2BE' } },
    { id: 10, raceId: 2, position: 2, time: '+23.688s',     points: 18, penalty: '0s', fastestLap: '', driver: { id: 7, name: 'George Russell',        number: 63 }, team: { id: 4, name: 'Mercedes', color: '#00D2BE' } },
    { id: 11, raceId: 2, position: 3, time: '+34.142s',     points: 15, penalty: '0s', fastestLap: '', driver: { id: 4, name: 'Oscar Piastri',         number: 81 }, team: { id: 2, name: 'McLaren',  color: '#ff9500' } },
    { id: 12, raceId: 2, position: 4, time: '+35.643s',     points: 12, penalty: '0s', fastestLap: '', driver: { id: 3, name: 'Lando Norris',          number: 1  }, team: { id: 2, name: 'McLaren',  color: '#ff9500' } },
    { id: 13, raceId: 2, position: 5, time: '+39.781s',     points: 10, penalty: '0s', fastestLap: '', driver: { id: 5, name: 'Lewis Hamilton',        number: 44 }, team: { id: 3, name: 'Ferrari',  color: '#7a0505' } },
    { id: 14, raceId: 2, position: 6, time: '+68.409s',     points: 8,  penalty: '0s', fastestLap: '', driver: { id: 6, name: 'Charles Leclerc',       number: 16 }, team: { id: 3, name: 'Ferrari',  color: '#7a0505' } },
    { id: 15, raceId: 2, position: 7, time: '+21.737s',     points: 6,  penalty: '0s', fastestLap: '', driver: { id: 2, name: 'Isack Hadjar',          number: 2  }, team: { id: 1, name: 'Red Bull', color: '#FF0000' } },
    { id: 16, raceId: 2, position: 8, time: '+71.754s',     points: 4,  penalty: '0s', fastestLap: '', driver: { id: 1, name: 'Max Verstappen',        number: 3  }, team: { id: 1, name: 'Red Bull', color: '#FF0000' } },
  ],
};

// ─── Incidents ────────────────────────────────────────────────────────────────
export const RACE_INCIDENTS: Record<number, any[]> = {
  1: [{
    id: 1, raceId: 1, lap: 1, description: 'Crash at Sainte Dévote corner',
    driver: { id: 1, name: 'Max Verstappen', number: 3, team: { name: 'Red Bull', color: '#FF0000' } },
    penalty: { id: 1, type: 'TimePenalty', value: '5' },
  }],
  2: [{
    id: 2, raceId: 2, lap: 4, description: 'Reckless driving — forced rival off track at S-curves',
    driver: { id: 8, name: 'Andrea Kimi Antonelli', number: 12, team: { name: 'Mercedes', color: '#00D2BE' } },
    penalty: { id: 2, type: 'TimePenalty', value: '2' },
  }],
};

// ─── Stewards ─────────────────────────────────────────────────────────────────
export const STEWARDS = [
  { id: 2, username: 'steward1', createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' },
  { id: 3, username: 'steward2', createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' },
];

// ─── Championship Standings ───────────────────────────────────────────────────
export const DRIVER_STANDINGS = [
  { id: 7, driverName: 'George Russell',        number: 63, teamName: 'Mercedes', teamColor: '#00D2BE', totalPoints: 43, wins: 1, podiums: 2, racesParticipated: 2 },
  { id: 8, driverName: 'Andrea Kimi Antonelli', number: 12, teamName: 'Mercedes', teamColor: '#00D2BE', totalPoints: 43, wins: 1, podiums: 2, racesParticipated: 2 },
  { id: 4, driverName: 'Oscar Piastri',         number: 81, teamName: 'McLaren',  teamColor: '#ff9500', totalPoints: 30, wins: 0, podiums: 2, racesParticipated: 2 },
  { id: 3, driverName: 'Lando Norris',          number: 1,  teamName: 'McLaren',  teamColor: '#ff9500', totalPoints: 27, wins: 0, podiums: 0, racesParticipated: 2 },
  { id: 5, driverName: 'Lewis Hamilton',        number: 44, teamName: 'Ferrari',  teamColor: '#7a0505', totalPoints: 18, wins: 0, podiums: 0, racesParticipated: 2 },
  { id: 6, driverName: 'Charles Leclerc',       number: 16, teamName: 'Ferrari',  teamColor: '#7a0505', totalPoints: 18, wins: 0, podiums: 0, racesParticipated: 2 },
  { id: 2, driverName: 'Isack Hadjar',          number: 2,  teamName: 'Red Bull', teamColor: '#FF0000', totalPoints: 10, wins: 0, podiums: 0, racesParticipated: 2 },
  { id: 1, driverName: 'Max Verstappen',        number: 3,  teamName: 'Red Bull', teamColor: '#FF0000', totalPoints: 14, wins: 0, podiums: 0, racesParticipated: 2 },
];

export const TEAM_STANDINGS = [
  { id: 4, fullName: 'Mercedes-AMG Petronas', color: '#00D2BE', teamName: 'Mercedes', totalPoints: 86, wins: 2, podiums: 4, racesParticipated: 2 },
  { id: 2, fullName: 'Google McLaren',        color: '#ff9500', teamName: 'McLaren',  totalPoints: 57, wins: 0, podiums: 2, racesParticipated: 2 },
  { id: 3, fullName: 'HP Ferrari',            color: '#7a0505', teamName: 'Ferrari',  totalPoints: 36, wins: 0, podiums: 0, racesParticipated: 2 },
  { id: 1, fullName: 'Oracle Red Bull Racing',color: '#FF0000', teamName: 'Red Bull', totalPoints: 24, wins: 0, podiums: 0, racesParticipated: 2 },
];

// ─── Mock users (for local auth) ──────────────────────────────────────────────
export const MOCK_USERS = [
  { id: 1, username: 'admin@f1control.com', password: 'admin123', role: 'ADMIN',   isDemo: false },
  { id: 2, username: 'steward1',            password: 'steward123', role: 'STEWARD', isDemo: false },
  { id: 3, username: 'steward2',            password: 'steward123', role: 'STEWARD', isDemo: false },
  { id: 4, username: 'demo_admin',          password: 'demo123',  role: 'ADMIN',   isDemo: true  },
  { id: 5, username: 'demo_steward',        password: 'demo123',  role: 'STEWARD', isDemo: true  },
];

// ─── Analytics ────────────────────────────────────────────────────────────────
export const PENALTY_STATS = [
  { penaltyType: 'TimePenalty',  count: 2, totalValue: '7 seconds',   percentage: 100 },
];

export const DRIVER_INCIDENTS = [
  { id: 1, driverName: 'Max Verstappen',        number: 3,  teamName: 'Red Bull', teamColor: '#FF0000', totalIncidents: 1, racesWithIncidents: 1, timePenalties: 1, gridPenalties: 0, warnings: 0 },
  { id: 8, driverName: 'Andrea Kimi Antonelli', number: 12, teamName: 'Mercedes', teamColor: '#00D2BE', totalIncidents: 1, racesWithIncidents: 1, timePenalties: 1, gridPenalties: 0, warnings: 0 },
];

export const TEAM_PERFORMANCE = [
  { teamId: 4, teamName: 'Mercedes', color: '#00D2BE', races: 2, wins: 2, podiums: 4, points: 86, avgPoints: 43, avgPosition: 1.5 },
  { teamId: 2, teamName: 'McLaren',  color: '#ff9500', races: 2, wins: 0, podiums: 2, points: 57, avgPoints: 28.5, avgPosition: 3.5 },
  { teamId: 3, teamName: 'Ferrari',  color: '#7a0505', races: 2, wins: 0, podiums: 0, points: 36, avgPoints: 18,  avgPosition: 5.5 },
  { teamId: 1, teamName: 'Red Bull', color: '#FF0000', races: 2, wins: 0, podiums: 0, points: 24, avgPoints: 12,  avgPosition: 7.5 },
];

export const DRIVER_RATINGS = DRIVER_STANDINGS.map((d, i) => ({
  driverId: d.id, driverName: d.driverName, number: d.number,
  teamName: d.teamName, teamColor: d.teamColor,
  rating: Math.max(60, 95 - i * 4),
  wins: d.wins, podiums: d.podiums, points: d.totalPoints,
}));

export const TRIGGERS = [
  { name: 'after_race_result_insert', event: 'INSERT', table: 'RaceResult', description: 'Updates driver points after a race result is inserted.' },
  { name: 'after_penalty_insert',     event: 'INSERT', table: 'Penalty',    description: 'Recalculates standings when a penalty is applied.' },
];
