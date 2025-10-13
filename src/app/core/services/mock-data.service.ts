import { Injectable } from '@angular/core';
import { of, delay, Observable } from 'rxjs';
import { Player } from '../models/player.model';
import { Team } from '../models/team.model';
import { Match } from '../models/match.model';


@Injectable({ providedIn: 'root' })
export class MockDataService {
private teams: Team[] = [
{ id: 'g2', name: 'G2 Esports', acronym: 'G2', region: 'LEC', logoUrl: 'https://assets.example/g2.png', players: ['caps','han'] },
{ id: 'gen', name: 'Gen.G', acronym: 'GEN', region: 'LCK', logoUrl: 'https://assets.example/gen.png', players: ['chovy','peyz'] },
];


private players: Player[] = [
{ id: 'caps', summonerName: 'Caps', role: 'MID', team: { id: 'g2', name: 'G2 Esports', region: 'LEC' }, country: 'DK', photoUrl: 'https://assets.example/caps.jpg', stats: { kda: 5.2, kpr: 0.68, dpm: 620, cspm: 9.1 } },
{ id: 'han', summonerName: 'Hans sama', role: 'ADC', team: { id: 'g2', name: 'G2 Esports', region: 'LEC' }, country: 'FR', photoUrl: 'https://assets.example/hans.jpg', stats: { kda: 6.1, kpr: 0.71, dpm: 650, cspm: 10.1 } },
{ id: 'chovy', summonerName: 'Chovy', role: 'MID', team: { id: 'gen', name: 'Gen.G', region: 'LCK' }, country: 'KR', photoUrl: 'https://assets.example/chovy.jpg', stats: { kda: 7.0, kpr: 0.69, dpm: 640, cspm: 9.5 } },
{ id: 'peyz', summonerName: 'Peyz', role: 'ADC', team: { id: 'gen', name: 'Gen.G', region: 'LCK' }, country: 'KR', photoUrl: 'https://assets.example/peyz.jpg', stats: { kda: 5.5, kpr: 0.65, dpm: 600, cspm: 9.8 } },
];


private schedule: Match[] = [
{ id: 'm1', startTime: new Date().toISOString(), tournament: 'Worlds 2025 – Groups', blue: { id:'g2', name:'G2 Esports', region:'LEC' }, red: { id:'gen', name:'Gen.G', region:'LCK' }, format: 'BO1' },
];


getWorldsPlayers(): Observable<Player[]> { return of(this.players).pipe(delay(250)); }
getWorldsTeams(): Observable<Team[]> { return of(this.teams).pipe(delay(250)); }
getSchedule(): Observable<Match[]> { return of(this.schedule).pipe(delay(250)); }
getPlayerById(id: string): Observable<Player|undefined> { return of(this.players.find(p => p.id === id)).pipe(delay(150)); }
}