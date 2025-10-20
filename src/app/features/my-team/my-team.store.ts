import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { MockDataService } from '../../core/services/mock-data.service';

// ===== Tipos (ligero, suficiente para la UI) =====
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

@Injectable({ providedIn: 'root' })
export class MyTeamStore {
  private mock = inject(MockDataService);

  // ---- state ----
  leagues = signal<LeagueSummary[]>([]);
  currentLeagueId = signal<string | null>(null);

  roster = signal<MyTeamVm | null>(null);
  standings = signal<StandingRow[]>([]);
  history = signal<WeekPoints[]>([]);

  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Derivados
  currentLeague = computed(() =>
    this.leagues().find(l => l.id === this.currentLeagueId()) ?? null
  );

  // ---------- API pública ----------
  init(): void {
    this.loading.set(true);
    this.error.set(null);

    this.fetchMyLeagues()
      .pipe(
        tap(ls => {
          this.leagues.set(ls);
          if (!this.currentLeagueId() && ls.length) {
            this.currentLeagueId.set(ls[0].id);
          }
        }),
        switchMap(() => {
          const id = this.currentLeagueId();
          return id ? this.loadLeagueData(id) : of(void 0);
        }),
        catchError(err => {
          this.error.set('No se pudieron cargar tus ligas/equipos.');
          return of(void 0);
        })
      )
      .subscribe(() => this.loading.set(false));
  }

  selectLeague(id: string): void {
    if (this.currentLeagueId() === id) return;
    this.currentLeagueId.set(id);
    this.loading.set(true);
    this.error.set(null);

    this.loadLeagueData(id)
      .pipe(
        catchError(() => {
          this.error.set('No se pudo cambiar de liga.');
          return of(void 0);
        })
      )
      .subscribe(() => this.loading.set(false));
  }

  // ---------- “Privado” ----------
  private fetchMyLeagues(): Observable<LeagueSummary[]> {
    return this.mock.getMyLeagues$();
  }

  private loadLeagueData(leagueId: string): Observable<void> {
    return forkJoin({
      team: this.mock.getMyTeam$(leagueId),
      standings: this.mock.getLeagueStandings$(leagueId),
      history: this.mock.getLeagueHistory$(leagueId),
    }).pipe(
      tap(({ team, standings, history }) => {
        this.roster.set(team);
        this.standings.set(standings);
        this.history.set(history);
      }),
      map(() => void 0)
    );
  }
}
