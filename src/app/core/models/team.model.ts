// -------------------------------------------------------------
export interface Team {
id: string;
name: string;
acronym?: string; // ej. GEN, TES, G2
region: string;
logoUrl?: string;
players?: string[]; // ids (relación simple)
}

export type Role = 'TOP' | 'JUNGLE' | 'MID' | 'ADC' | 'SUPPORT';

export interface PlayerLite {
  id: number;
  name: string;
  team: string;     // nombre del equipo profesional
  role: Role;
  cost: number;
}

export interface TeamSlot {
  id: number;
  role: Role;
  // puntos de la semana en curso (mock), opcional:
  pointsWeek?: number;
  // cuando está asignado:
  player?: PlayerLite;
}

export interface MyTeam {
  id: number;
  name: string;
  budget: number;
  slots: TeamSlot[];
  // agregados mock
  cost?: number;
  pointsWeek?: number;
}

export interface LeagueSummary {
  id: string;
  name: string;
}

export interface StandingEntry {
  rank: number;
  user: string;
  points: number;
}

export interface WeekPoints {
  week: number;
  points: number;
}