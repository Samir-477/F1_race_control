
export interface Driver {
  id: number;
  name: string;
  number: number;
  nationality: string;
  podiums: number;
  points: number;
  worldChampionships: number;
  imageUrl: string;
}

export interface Car {
  model: string;
  engine: string;
  chassis: string;
  imageUrl?: string;
}

export interface Sponsor {
  id: number;
  name: string;
  logoUrl?: string;
}

export interface Team {
  id: number;
  name: string;
  fullName: string;
  description: string;
  base: string;
  teamChief: string;
  drivers: Driver[];
  topPerformer?: Driver;
  car?: Car;
  sponsors: Sponsor[];
  color: string; // Hex color code
  textColor?: string;
  backgroundImageUrl?: string;
}

export interface RaceIncident {
  id: number;
  lap: number;
  driver: Driver;
  description: string;
  penaltyApplied?: Penalty;
}

export interface Penalty {
  id: number;
  type: 'Time Penalty' | 'Grid Penalty' | 'Warning';
  value: string; // e.g., "5 seconds", "3 grid places"
}

export interface RaceResult {
  position: number;
  driver: Driver;
  team: Team;
  time: string;
  points: number;
  penalty: string;
  fastestLap: string;
}

export interface Race {
  id: number;
  name: string;
  location: string;
  date: string;
  results: RaceResult[];
  incidents: RaceIncident[];
}

export enum UserRole {
  ADMIN = 'ADMIN',
  STEWARD = 'STEWARD',
  GUEST = 'GUEST'
}

export interface User {
  id: number;
  username: string;
  role: UserRole | string;
}