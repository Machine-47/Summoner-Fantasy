import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { map, Observable } from 'rxjs';

export type TeamInfo = { name: string; count: number };

type PlayerDto = {
    id: number; team: string; name: string; role: string; birthday: string; age: number; cost: number;
};

export type Player = {
    id: number;
    summonerName: string;
    role: 'TOP'|'JUNGLE'|'MID'|'ADC'|'SUPPORT';
    team: { name: string; region: string };
    photoUrl?: string;
    stats?: { kda?: number; kpr?: number; dpm?: number; cspm?: number };
    cost: number;
};

export type MyTeam = {
  id: number;
  name: string;
  budget: number;
  slots: { id: number; role: 'TOP'|'JUNGLE'|'MID'|'ADC'|'SUPPORT'; playerId?: number|null;
           player?: { id:number; name:string; team:string; role:string; cost:number } }[];
};

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = environment.apiBaseUrl;

  getMyTeam$(): Observable<MyTeam> {
    return this.http.get<MyTeam>(`${this.base}/api/my-team`, { withCredentials: true });
  }

  buyPlayer(slotId: number, playerId: number): Observable<MyTeam> {
    return this.http.post<MyTeam>(`${this.base}/api/my-team/buy`, { slotId, playerId }, { withCredentials: true });
  }

  sellPlayer(slotId: number): Observable<MyTeam> {
    return this.http.post<MyTeam>(`${this.base}/api/my-team/sell`, { slotId }, { withCredentials: true });
  }

getPlayers$(params?: { team?: string; role?: string; minCost?: number; maxCost?: number }): Observable<Player[]> {
    let httpParams = new HttpParams();
    if (params?.team) httpParams = httpParams.set('team', params.team);
    if (params?.role) httpParams = httpParams.set('role', params.role);
    if (params?.minCost != null) httpParams = httpParams.set('minCost', params.minCost);
    if (params?.maxCost != null) httpParams = httpParams.set('maxCost', params.maxCost);

    return this.http.get<PlayerDto[]>(`${this.base}/api/players`, { params: httpParams }).pipe(
        map(list => list.map(d => ({
        id: d.id,
        summonerName: d.name,
        role: (d.role.toUpperCase() as Player['role']).replace('BOT', 'ADC') as Player['role'],
        team: { name: d.team, region: '—' },
        cost: d.cost
        })))
    );
    }

getPlayer$(id: number): Observable<Player> {
    return this.http.get<PlayerDto>(`${this.base}/api/players/${id}`).pipe(
        map(d => ({
            id: d.id,
            summonerName: d.name,
            role: (d.role.toUpperCase() as Player['role']).replace('BOT', 'ADC') as Player['role'],
            team: { name: d.team, region: '—' },
            cost: d.cost
        }))
    );
    }

getTeams$(): Observable<TeamInfo[]> {
    return this.http.get<TeamInfo[]>(`${this.base}/api/teams`);
}
}


