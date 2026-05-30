import {
  TEAMS, CIRCUITS, SEASONS, RACES, RACE_RESULTS, RACE_INCIDENTS,
  STEWARDS, DRIVER_STANDINGS, TEAM_STANDINGS, MOCK_USERS,
  PENALTY_STATS, DRIVER_INCIDENTS, TEAM_PERFORMANCE, DRIVER_RATINGS, TRIGGERS,
} from './mockData';

const ok = (data: any, status = 200) =>
  Promise.resolve(new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  }));

const notFound = () =>
  Promise.resolve(new Response(JSON.stringify({ error: 'Not found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' },
  }));

const forbidden = () =>
  Promise.resolve(new Response(JSON.stringify({ error: 'Demo accounts are read-only.' }), {
    status: 403,
    headers: { 'Content-Type': 'application/json' },
  }));

function mockRouter(url: string, options?: RequestInit): Promise<Response> {
  const method = (options?.method || 'GET').toUpperCase();

  // Strip origin so we just match path+query
  let path = url;
  try { path = new URL(url).pathname + new URL(url).search; } catch {}
  // Normalise: remove leading /
  path = path.replace(/^\//, '');

  // ── Auth ──────────────────────────────────────────────────────────────
  if (path === 'auth/login' && method === 'POST') {
    const body = JSON.parse((options?.body as string) || '{}');
    const user = MOCK_USERS.find(
      u => u.username === body.username && u.password === body.password
    );
    if (!user) return ok({ error: 'Invalid credentials' }, 401);
    const { password, ...safeUser } = user;
    return ok({ token: `mock-token-${user.id}`, user: safeUser });
  }

  // Block all writes for any mock endpoint
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) return forbidden();

  // ── Teams ─────────────────────────────────────────────────────────────
  if (path === 'api/teams') return ok(TEAMS);

  const teamMatch = path.match(/^api\/teams\/(\d+)$/);
  if (teamMatch) {
    const team = TEAMS.find(t => t.id === +teamMatch[1]);
    return team ? ok(team) : notFound();
  }

  // ── Circuits / Seasons ────────────────────────────────────────────────
  if (path === 'api/circuits') return ok(CIRCUITS);
  if (path === 'api/seasons')  return ok(SEASONS);

  // ── Stewards ──────────────────────────────────────────────────────────
  if (path === 'api/stewards') return ok(STEWARDS);

  // ── Races ─────────────────────────────────────────────────────────────
  if (path === 'api/races' || path === 'api/races?') return ok(RACES);

  if (path === 'api/races/active') return notFound(); // no active race

  if (path === 'api/steward/history') return ok(RACES);

  // Latest result for landing page
  if (path === 'api/races/latest-result') {
    const race = RACES[RACES.length - 1];
    const results = RACE_RESULTS[race.id] || [];
    return ok({
      id: race.id,
      name: race.name,
      circuit: race.circuit.name,
      circuitLocation: race.circuit.location,
      circuitCountry: race.circuit.country,
      date: race.date,
      season: race.season.year,
      standings: results.map(r => ({
        position: r.position,
        driver: r.driver.name,
        team: r.team.name,
        time: r.time,
        points: r.points,
        penalty: r.penalty,
      })),
    });
  }

  const raceMatch = path.match(/^api\/races\/(\d+)(\/(.+))?$/);
  if (raceMatch) {
    const raceId = +raceMatch[1];
    const sub    = raceMatch[3] || '';
    const race   = RACES.find(r => r.id === raceId);
    if (!race) return notFound();

    if (!sub || sub === '')        return ok(race);
    if (sub === 'participants')    return ok({ ...race, participations: race.participations });
    if (sub === 'results')         return ok(RACE_RESULTS[raceId] || []);
    if (sub === 'race-incidents')  return ok(RACE_INCIDENTS[raceId] || []);
    if (sub === 'incidents')       return ok(RACE_INCIDENTS[raceId] || []);
    if (sub === 'logs')            return ok([]);

    // standings — used by RaceMonitoringView
    if (sub === 'standings') {
      const results = RACE_RESULTS[raceId] || [];
      return ok({
        standings: results.map(r => ({
          position: r.position,
          driverName: r.driver.name,
          driverNumber: r.driver.number,
          teamName: r.team.name,
          teamColor: r.team.color,
          time: r.time,
          points: r.points,
          penalty: r.penalty,
          gap: r.position === 1 ? 'Leader' : r.time,
        })),
        totalLaps: race.circuit.laps,
      });
    }
  }

  // ── Analytics ─────────────────────────────────────────────────────────
  const champMatch = path.match(/^api\/analytics\/championship-standings\/(\d+)\/(driver|team)/);
  if (champMatch) {
    return ok(champMatch[2] === 'driver' ? DRIVER_STANDINGS : TEAM_STANDINGS);
  }

  if (path.includes('api/analytics/team-performance'))   return ok(TEAM_PERFORMANCE);
  if (path.includes('api/analytics/penalty-statistics')) return ok(PENALTY_STATS);
  if (path.includes('api/analytics/drivers-with-incidents')) return ok(DRIVER_INCIDENTS);
  if (path.includes('api/analytics/driver-ratings'))     return ok(DRIVER_RATINGS);
  if (path.includes('api/analytics'))                    return ok([]);

  // Race report / race results view sub-routes
  if (path.includes('api/race-report')) return ok([]);

  // Triggers
  if (path.includes('api/triggers')) return ok(TRIGGERS);

  // Fallback
  console.warn('[mockFetch] unhandled:', method, path);
  return ok([]);
}

export function initMockFetch() {
  window.fetch = (input, init?) => {
    const url = typeof input === 'string' ? input : (input as Request).url;
    return mockRouter(url, init as RequestInit | undefined);
  };
}
