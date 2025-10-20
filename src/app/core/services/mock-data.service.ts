import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';

// ===== Tipos compartidos con el store =====
export type Role = 'TOP' | 'JUNGLE' | 'MID' | 'ADC' | 'SUPPORT';

export interface LeagueSummary {
  id: string;
  name: string;
  myRank: number;
  myPointsWeek: number;
  myPointsTotal: number;
}

export interface TeamSlotVm {
  id: number;
  role: Role;
  player: { id: string; name: string; team: string; role: Role; cost: number };
  pointsWeek: number;
}

export interface MyTeamVm {
  id: string;
  leagueId: string;
  name: string;
  budget: number;
  slots: TeamSlotVm[];
  pointsWeek: number;
  pointsTotal: number;
}

export interface StandingRow {
  rank: number;
  user: string;
  points: number;
}

export interface WeekPoints {
  week: number;
  points: number;
}

// ======= Mock real que ya tenías (lo dejo abreviado) =======
export interface Team { id: string; name: string; acronym: string; region: string; logoUrl: string; players: string[]; }
export interface Player { id: string; summonerName: string; role: Role; team: { id: string; name: string; region: string }; country: string; photoUrl: string; stats: { kda: number; kpr: number; dpm: number; cspm: number }; }
export interface Match { id: string; startTime: string; tournament: string; blue: { id: string; name: string; region: string }; red: { id: string; name: string; region: string }; format: string; }

@Injectable({ providedIn: 'root' })
export class MockDataService {
  // ====== tus datos anteriores (abreviados aquí) ======
  private teams: Team[] = [
    { id: 'g2',  name: 'G2 Esports', acronym: 'G2',  region: 'LEC', logoUrl: 'https://assets.example/g2.png',  players: ['caps','han'] },
    { id: 'gen', name: 'Gen.G',      acronym: 'GEN', region: 'LCK', logoUrl: 'https://assets.example/gen.png', players: ['chovy','peyz'] },
  ];

  private players: Player[] = [
    { id: 'caps',  summonerName: 'Caps',       role: 'MID', team: { id:'g2',  name:'G2 Esports', region:'LEC' }, country:'DK', photoUrl:'https://assets.example/caps.jpg',  stats:{ kda:5.2, kpr:0.68, dpm:620, cspm:9.1 } },
    { id: 'han',   summonerName: 'Hans sama',  role: 'ADC', team: { id:'g2',  name:'G2 Esports', region:'LEC' }, country:'FR', photoUrl:'https://assets.example/hans.jpg',  stats:{ kda:6.1, kpr:0.71, dpm:650, cspm:10.1 } },
    { id: 'chovy', summonerName: 'Chovy',      role: 'MID', team: { id:'gen', name:'Gen.G',      region:'LCK' }, country:'KR', photoUrl:'https://assets.example/chovy.jpg', stats:{ kda:7.0, kpr:0.69, dpm:640, cspm:9.5 } },
    { id: 'peyz',  summonerName: 'Peyz',       role: 'ADC', team: { id:'gen', name:'Gen.G',      region:'LCK' }, country:'KR', photoUrl:'https://assets.example/peyz.jpg',  stats:{ kda:5.5, kpr:0.65, dpm:600, cspm:9.8 } },
  ];

  private schedule: Match[] = [
    { id: 'm1', startTime: new Date().toISOString(), tournament: 'Worlds 2025 – Groups', blue: { id:'g2', name:'G2 Esports', region:'LEC' }, red: { id:'gen', name:'Gen.G', region:'LCK' }, format: 'BO1' },
  ];

  // ====== NUEVOS MOCKS PARA "MI EQUIPO" ======
  private leagues: LeagueSummary[] = [
    { id: 'lg-worlds', name: 'Fantasy Worlds', myRank: 3, myPointsWeek: 118, myPointsTotal: 635 },
    { id: 'lg-sologq', name: 'Tryharders',     myRank: 1, myPointsWeek: 126, myPointsTotal: 710 },
  ];

  private rosterByLeague: Record<string, MyTeamVm> = {
    'lg-worlds': {
      id: 't1',
      leagueId: 'lg-worlds',
      name: 'Makina • Worlds',
      budget: 0,
      slots: [
        { id: 1, role: 'TOP',     player: { id:'zeus',  name:'Zeus',  team:'T1',    role:'TOP',     cost:5 }, pointsWeek: 20 },
        { id: 2, role: 'JUNGLE',  player: { id:'canyon',name:'Canyon',team:'Gen.G', role:'JUNGLE',  cost:4 }, pointsWeek: 18 },
        { id: 3, role: 'MID',     player: { id:'chovy', name:'Chovy', team:'Gen.G', role:'MID',     cost:5 }, pointsWeek: 25 },
        { id: 4, role: 'ADC',     player: { id:'elk',   name:'Elk',   team:'BLG',   role:'ADC',     cost:4 }, pointsWeek: 22 },
        { id: 5, role: 'SUPPORT', player: { id:'delight',name:'Delight',team:'HLE', role:'SUPPORT', cost:5 }, pointsWeek: 16 },
      ],
      pointsWeek: 101,
      pointsTotal: 635,
    },
    'lg-sologq': {
      id: 't2',
      leagueId: 'lg-sologq',
      name: 'Makina • Tryharders',
      budget: 0,
      slots: [
        { id: 1, role: 'TOP',     player: { id:'zeus',  name:'Zeus',  team:'T1',    role:'TOP',     cost:5 }, pointsWeek: 24 },
        { id: 2, role: 'JUNGLE',  player: { id:'canyon',name:'Canyon',team:'Gen.G', role:'JUNGLE',  cost:4 }, pointsWeek: 21 },
        { id: 3, role: 'MID',     player: { id:'creme', name:'Creme', team:'TES',   role:'MID',     cost:5 }, pointsWeek: 23 },
        { id: 4, role: 'ADC',     player: { id:'ruler', name:'Ruler', team:'TES',   role:'ADC',     cost:5 }, pointsWeek: 28 },
        { id: 5, role: 'SUPPORT', player: { id:'on',    name:'ON',    team:'BLG',   role:'SUPPORT', cost:4 }, pointsWeek: 20 },
      ],
      pointsWeek: 116,
      pointsTotal: 710,
    },
  };

  private standingsByLeague: Record<string, StandingRow[]> = {
    'lg-worlds': [
      { rank: 1, user: 'Tryhard', points: 702 },
      { rank: 2, user: 'NoTilt',   points: 661 },
      { rank: 3, user: 'Makina',   points: 635 },
      { rank: 4, user: 'IsGnar',   points: 545 },
    ],
    'lg-sologq': [
      { rank: 1, user: 'Makina',   points: 710 },
      { rank: 2, user: 'Ninja',    points: 654 },
      { rank: 3, user: 'Xpeke',    points: 623 },
      { rank: 4, user: 'G2Fan',    points: 590 },
    ],
  };

  private historyByLeague: Record<string, WeekPoints[]> = {
    'lg-worlds': [{ week: 1, points: 92 }, { week: 2, points: 110 }, { week: 3, points: 101 }, { week: 4, points: 118 }],
    'lg-sologq': [{ week: 1, points: 95 }, { week: 2, points: 120 }, { week: 3, points: 126 }],
  };

  // ==== MÉTODOS QUE YA TENÍAS ====
  getWorldsPlayers(): Observable<Player[]> { return of(this.players).pipe(delay(250)); }
  getWorldsTeams():   Observable<Team[]>   { return of(this.teams).pipe(delay(250)); }
  getSchedule():      Observable<Match[]>  { return of(this.schedule).pipe(delay(250)); }
  getPlayerById(id: string): Observable<Player|undefined> { return of(this.players.find(p => p.id === id)).pipe(delay(150)); }

  // ==== NUEVOS MÉTODOS USADOS POR “Mi equipo” ====
  getMyLeagues$(): Observable<LeagueSummary[]> {
    return of(this.leagues).pipe(delay(200));
  }

  getMyTeam$(leagueId: string): Observable<MyTeamVm> {
    const t = this.rosterByLeague[leagueId];
    return of(t).pipe(delay(200));
  }

  getLeagueStandings$(leagueId: string): Observable<StandingRow[]> {
    return of(this.standingsByLeague[leagueId] ?? []).pipe(delay(200));
  }

  getLeagueHistory$(leagueId: string): Observable<WeekPoints[]> {
    return of(this.historyByLeague[leagueId] ?? []).pipe(delay(200));
  }
}
