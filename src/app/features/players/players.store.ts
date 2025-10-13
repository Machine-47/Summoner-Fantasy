import { Injectable, computed, inject, signal } from '@angular/core';
import { ApiService, Player, TeamInfo } from '../../core/services/api.service';

type RoleFilter = 'ALL'|'TOP'|'JUNGLE'|'MID'|'ADC'|'SUPPORT';

@Injectable({ providedIn: 'root' })
export class PlayersStore {
  private api = inject(ApiService);

  players = signal<Player[]>([]);
  teams   = signal<TeamInfo[]>([]);
  query   = signal('');
  role    = signal<RoleFilter>('ALL');
  team    = signal<string>('ALL');
  region  = signal<'ALL'|'LEC'|'LCK'|'LPL'|'LCS'|'PCS'|'VCS'|'—'>('ALL');

  // coste
  minCost = signal<number>(0);
  maxCost = signal<number>(10);
  costMinSel = signal<number>(0);
  costMaxSel = signal<number>(10);

  loading = signal(false);
  error   = signal<string|null>(null);

  load() {
    this.loading.set(true);
    this.error.set(null);

    this.api.getPlayers$().subscribe({
      next: list => {
        this.players.set(list);
        this.loading.set(false);

        // calcula min/max coste
        const costs = list.map(p => p.cost);
        const min = costs.length ? Math.min(...costs) : 0;
        const max = costs.length ? Math.max(...costs) : 10;
        this.minCost.set(min);
        this.maxCost.set(max);
        this.costMinSel.set(min);
        this.costMaxSel.set(max);

        // fallback equipos desde jugadores (por si /api/teams falla)
        const map = new Map<string, number>();
        list.forEach(p => map.set(p.team.name, (map.get(p.team.name) || 0) + 1));
        this.teams.set([...map].map(([name,count]) => ({ name, count })).sort((a,b) => a.name.localeCompare(b.name)));
      },
      error: () => { this.error.set('No se pudieron cargar los jugadores'); this.loading.set(false); }
    });

    // carga equipos desde API (si llega, sobreescribe)
    this.api.getTeams$().subscribe({
      next: t => { if (t?.length) this.teams.set(t); },
      error: () => {}
    });
  }

  filtered = computed(() => {
    const q = this.query().toLowerCase();
    const costMin = this.costMinSel();
    const costMax = this.costMaxSel();

    return this.players().filter(p => {
      const byQuery  = !q || p.summonerName.toLowerCase().includes(q) || p.team.name.toLowerCase().includes(q);
      const byRole   = this.role() === 'ALL'  || p.role === this.role();
      const byTeam   = this.team() === 'ALL'  || p.team.name === this.team();
      const byRegion = this.region() === 'ALL'|| p.team.region === this.region();
      const byCost   = p.cost >= costMin && p.cost <= costMax;
      return byQuery && byRole && byTeam && byRegion && byCost;
    });
  });
}
