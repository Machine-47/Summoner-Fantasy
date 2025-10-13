import { TeamRef } from './player.model'; // ⬅️ añade esto

export interface Match {
  id: string;
  startTime: string;    // ISO
  tournament: string;   // Worlds 2025, Play-Ins, etc.
  blue: TeamRef;
  red: TeamRef;
  format: 'BO1' | 'BO3' | 'BO5';
}
