import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ApiService, Player } from '../../core/services/api.service';

type Role = 'TOP'|'JUNGLE'|'MID'|'ADC'|'SUPPORT';
const ROLES: Role[] = ['TOP','JUNGLE','MID','ADC','SUPPORT'];

type TeamCard = {
  name: string;
  region: string;
  count: number;
  slug: string;
  logoUrl: string;
};

@Component({
  standalone: true,
  selector: 'app-teams-page',
  imports: [NgIf, NgFor, RouterLink],
  template: `
<section class="px-3 md:px-6 py-4 space-y-4">
  <header class="space-y-1">
    <h1 class="text-2xl md:text-3xl font-extrabold tracking-tight text-white font-display">Equipos</h1>
    <p class="text-xs text-white/60">Explora todos los equipos profesionales.</p>
  </header>

  <div class="rounded-xl border border-white/10 bg-white/5 p-3 flex items-center gap-3">
    <input
      type="text"
      class="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#7d0c87]"
      placeholder="Buscar equipo…"
      [value]="q()"
      (input)="q.set($any($event.target).value)"
    />
    <div class="text-[11px] text-white/60">{{ filtered().length }} resultado(s)</div>
  </div>

  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    <a *ngFor="let t of filtered(); trackBy: trackSlug"
       [routerLink]="['/teams', t.slug]"
       class="group rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/15 transition p-4 flex items-center gap-3">
      <div class="relative">
        <img [src]="t.logoUrl" (error)="onImgError($event)" alt="" class="w-14 h-14 rounded-xl object-cover border border-white/10" >
        <div class="absolute inset-0 rounded-xl ring-1 ring-white/5 group-hover:ring-white/15"></div>
      </div>
      <div class="min-w-0">
        <h3 class="font-display text-xl leading-6 text-white truncate">{{ t.name }}</h3>
        <div class="text-[12px] text-white/60 truncate">{{ t.region || '—' }}</div>
        <div class="text-[12px] text-white/60">{{ t.count }} jugador(es)</div>
      </div>
    </a>
  </div>
</section>
`
})
export class TeamsPage implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);

  q = signal('');
  teams = signal<TeamCard[]>([]);

  ngOnInit(): void {
    // Si tienes /api/teams, puedes usar api.getTeams$(). Aquí derivamos desde players (seguro).
    this.api.getPlayers$().subscribe(list => {
      const m = new Map<string, TeamCard>();
      for (const p of list) {
        const name = p.team?.name || 'Equipo desconocido';
        if (!m.has(name)) {
          const slug = slugify(name);
          m.set(name, {
            name,
            region: p.team?.region || '—',
            count: 0,
            slug,
            logoUrl: teamLogo(slug)
          });
        }
        m.get(name)!.count++;
      }
      this.teams.set([...m.values()].sort((a,b) => a.name.localeCompare(b.name)));
    });
  }

  filtered = computed(() => {
    const q = this.q().trim().toLowerCase();
    if (!q) return this.teams();
    return this.teams().filter(t =>
      t.name.toLowerCase().includes(q) || t.region.toLowerCase().includes(q)
    );
  });

  trackSlug = (_: number, t: TeamCard) => t.slug;

  onImgError(e: Event) {
  const el = e.target as HTMLImageElement;
  el.src = '/src/assets/placeholder.png';
}
}

/* ---------- helpers ---------- */

function slugify(s: string) {
  return s.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Usa /assets/teams/<slug>.png como convención; si no existe, se verá fallback
function teamLogo(slug: string) {
  return `/assets/teams/${slug}.png`; // busca la imagen local
}

function fallbackLogo(_name: string) {
  return '/assets/teams/_placeholder.png'; // si no existe, usa esta
}
