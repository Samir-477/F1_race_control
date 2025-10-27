import type { Team, Driver, Race, User, Car, Sponsor, RaceResult } from '../types';
import { UserRole } from '../types';

// Drivers
const maxVerstappen: Driver = { id: 1, name: 'Max Verstappen', number: 1, nationality: 'Dutch', podiums: 105, points: 2700, worldChampionships: 3, imageUrl: 'https://picsum.photos/id/10/400/500' };
const sergioPerez: Driver = { id: 2, name: 'Sergio Pérez', number: 11, nationality: 'Mexican', podiums: 39, points: 1500, worldChampionships: 0, imageUrl: 'https://picsum.photos/id/11/400/500' };
const landoNorris: Driver = { id: 3, name: 'Lando Norris', number: 4, nationality: 'British', podiums: 20, points: 800, worldChampionships: 0, imageUrl: 'https://picsum.photos/id/12/400/500' };
const oscarPiastri: Driver = { id: 4, name: 'Oscar Piastri', number: 81, nationality: 'Australian', podiums: 2, points: 200, worldChampionships: 0, imageUrl: 'https://picsum.photos/id/13/400/500' };
const charlesLeclerc: Driver = { id: 5, name: 'Charles Leclerc', number: 16, nationality: 'Monegasque', podiums: 35, points: 1200, worldChampionships: 0, imageUrl: 'https://picsum.photos/id/14/400/500' };
const carlosSainz: Driver = { id: 6, name: 'Carlos Sainz Jr.', number: 55, nationality: 'Spanish', podiums: 21, points: 1000, worldChampionships: 0, imageUrl: 'https://picsum.photos/id/15/400/500' };
const lewisHamilton: Driver = { id: 7, name: 'Lewis Hamilton', number: 44, nationality: 'British', podiums: 197, points: 4600, worldChampionships: 7, imageUrl: 'https://picsum.photos/id/16/400/500' };
const georgeRussell: Driver = { id: 8, name: 'George Russell', number: 63, nationality: 'British', podiums: 12, points: 600, worldChampionships: 0, imageUrl: 'https://picsum.photos/id/17/400/500' };

// Sponsors
const oracle: Sponsor = { id: 1, name: 'Oracle', logoUrl: '' };
const castore: Sponsor = { id: 2, name: 'Castore', logoUrl: '' };
const google: Sponsor = { id: 3, name: 'Google', logoUrl: '' };
const hp: Sponsor = { id: 4, name: 'HP', logoUrl: '' };
const petronas: Sponsor = { id: 5, name: 'Petronas', logoUrl: '' };

// Cars
const rb20: Car = { model: 'RB20', engine: 'Honda RBPTH002', chassis: 'Carbon composite', imageUrl: 'https://picsum.photos/id/20/800/600' };
const mcl38: Car = { model: 'MCL38', engine: 'Mercedes-AMG F1 M15', chassis: 'Carbon composite', imageUrl: 'https://picsum.photos/id/21/800/600' };
const sf24: Car = { model: 'SF-24', engine: 'Ferrari 066/12', chassis: 'Carbon composite', imageUrl: 'https://picsum.photos/id/22/800/600' };
const w15: Car = { model: 'W15', engine: 'Mercedes-AMG F1 M15', chassis: 'Carbon composite', imageUrl: 'https://picsum.photos/id/23/800/600' };

// Teams
export const TEAMS: Team[] = [
  {
    id: 1,
    name: 'Red Bull',
    fullName: 'Oracle Red Bull Racing',
    description: 'Oracle Red Bull Racing is a Formula One racing team, racing under an Austrian licence and based in the United Kingdom.',
    base: 'Milton Keynes, UK',
    teamChief: 'Christian Horner',
    drivers: [maxVerstappen, sergioPerez],
    topPerformer: maxVerstappen,
    car: rb20,
    sponsors: [oracle, castore],
    color: 'bg-blue-900',
    textColor: 'text-red-500',
  backgroundImageUrl: '/images/red_bull.png',
  },
  {
    id: 2,
    name: 'McLaren',
    fullName: 'McLaren Formula 1 Team',
    description: 'McLaren Racing Limited is a British motor racing team based at the McLaren Technology Centre in Woking, Surrey, England.',
    base: 'Woking, UK',
    teamChief: 'Andrea Stella',
    drivers: [landoNorris, oscarPiastri],
    topPerformer: landoNorris,
    car: mcl38,
    sponsors: [google],
    color: 'bg-orange-500',
    textColor: 'text-blue-400',
  backgroundImageUrl: '/images/mclearn.jpg',
  },
  {
    id: 3,
    name: 'Ferrari',
    fullName: 'Scuderia Ferrari',
    description: 'Scuderia Ferrari is the racing division of luxury Italian auto manufacturer Ferrari and the racing team that competes in Formula One racing.',
    base: 'Maranello, Italy',
    teamChief: 'Frédéric Vasseur',
    drivers: [charlesLeclerc, carlosSainz],
    topPerformer: charlesLeclerc,
    car: sf24,
    sponsors: [hp],
    color: 'bg-red-600',
    textColor: 'text-yellow-400',
  backgroundImageUrl: '/images/Ferrari.png',
  },
  {
    id: 4,
    name: 'Mercedes',
    fullName: 'Mercedes-AMG PETRONAS F1 Team',
    description: 'The Mercedes-AMG Petronas Formula One Team is the works team of Mercedes-Benz, competing in the FIA Formula One World Championship.',
    base: 'Brackley, UK',
    teamChief: 'Toto Wolff',
    drivers: [lewisHamilton, georgeRussell],
    topPerformer: lewisHamilton,
    car: w15,
    sponsors: [petronas],
    color: 'bg-teal-500',
    textColor: 'text-black',
  backgroundImageUrl: '/images/mercdes.png',
  },
];

// Past Races
export const RACES: Race[] = [
  {
    id: 1,
    name: 'Monaco Grand Prix',
    location: 'Monte Carlo, Monaco',
    date: '2024-05-26',
    results: [
      { position: 1, driver: charlesLeclerc, team: TEAMS[2], time: '1:48:23.123', points: 25, penalty: '0s', fastestLap: '1:14.165' },
      { position: 2, driver: oscarPiastri, team: TEAMS[1], time: '+7.152', points: 18, penalty: '0s', fastestLap: '1:14.550' },
      { position: 3, driver: carlosSainz, team: TEAMS[2], time: '+7.585', points: 15, penalty: '0s', fastestLap: '1:14.890' },
      { position: 4, driver: landoNorris, team: TEAMS[1], time: '+8.650', points: 12, penalty: '0s', fastestLap: '1:14.240' },
      { position: 5, driver: georgeRussell, team: TEAMS[3], time: '+13.309', points: 10, penalty: '0s', fastestLap: '1:15.111' },
      { position: 6, driver: maxVerstappen, team: TEAMS[0], time: '+13.853', points: 8, penalty: '0s', fastestLap: '1:14.999' },
    ],
    incidents: [
      { id: 1, lap: 1, driver: sergioPerez, description: 'Collision with Magnussen, retired from race.' },
      { id: 2, lap: 45, driver: lewisHamilton, description: 'Exceeded track limits, warning issued.'}
    ]
  },
];

// Live Race Data for Steward Dashboard
export const LIVE_RACE_DATA: Race = {
  id: 2,
  name: 'Italian Grand Prix',
  location: 'Monza, Italy',
  date: '2024-09-01',
  results: [
    { position: 1, driver: maxVerstappen, team: TEAMS[0], time: '88:13.350', points: 0, penalty: '0s', fastestLap: '1:29.345' },
    { position: 2, driver: charlesLeclerc, team: TEAMS[2], time: '88:21.120', points: 0, penalty: '0s', fastestLap: '1:29.511' },
    { position: 3, driver: landoNorris, team: TEAMS[1], time: '88:25.450', points: 0, penalty: '0s', fastestLap: '1:29.420' },
    { position: 4, driver: lewisHamilton, team: TEAMS[3], time: '88:32.980', points: 0, penalty: '0s', fastestLap: '1:29.876' },
    { position: 5, driver: georgeRussell, team: TEAMS[3], time: '88:35.010', points: 0, penalty: '0s', fastestLap: '1:30.102' },
    { position: 6, driver: oscarPiastri, team: TEAMS[1], time: '88:40.670', points: 0, penalty: '0s', fastestLap: '1:30.005' },
    { position: 7, driver: carlosSainz, team: TEAMS[2], time: '88:43.880', points: 0, penalty: '0s', fastestLap: '1:30.321' },
    { position: 8, driver: sergioPerez, team: TEAMS[0], time: '88:54.150', points: 0, penalty: '+4s', fastestLap: '1:30.554' },
  ],
  incidents: [
    { id: 1, lap: 15, driver: lewisHamilton, description: 'Causing a collision with Car 81 (Piastri) at Turn 4.' },
    { id: 2, lap: 28, driver: sergioPerez, description: 'Exceeding track limits multiple times, resulting in a 4s penalty.' },
    { id: 3, lap: 35, driver: georgeRussell, description: 'Unsafe release from pit box.'}
  ]
};

// Users
export const USERS: User[] = [
  { id: 1, username: 'admin', role: UserRole.ADMIN },
  { id: 2, username: 'steward', role: UserRole.STEWARD }
];