import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { ApiService, Player } from '../../core/services/api.service';
import { RoleBadgeComponent } from '../../shared/role-badge/role-badge.component';

type Role = 'TOP'|'JUNGLE'|'MID'|'ADC'|'SUPPORT';
const ROLES: Role[] = ['TOP','JUNGLE','MID','ADC','SUPPORT'];

@Component({
  standalone: true,
  selector: 'app-team-detail',
  imports: [NgIf, NgFor, RouterLink, RoleBadgeComponent],
  template: `
<section class="px-3 md:px-6 py-4 space-y-4" *ngIf="ready()">
  <div class="flex items-center justify-between">
    <a [routerLink]="['/teams']" class="text-xs text-white/60 hover:text-white">&larr; Volver</a>
    <span class="text-xs text-white/50">Detalle de equipo</span>
  </div>

  <!-- Header / Hero -->
  <header class="rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center gap-4">
    <img [src]="logoUrl()" (error)="onImgError($event)" alt="{{name()}}"
         class="w-16 h-16 md:w-20 md:h-20 rounded-xl object-cover border border-white/10">
    <div class="min-w-0">
      <h1 class="text-2xl md:text-3xl font-extrabold tracking-tight text-white font-display truncate">{{ name() }}</h1>
      <p class="text-[12px] text-white/60 truncate">{{ region() }}</p>
      <div class="text-[12px] text-white/60 mt-1">
        {{ players().length }} jugador(es) • Coste total {{ totalCost() }}
      </div>
    </div>
  </header>

  <!-- Descripción -->
  <section class="rounded-xl border border-white/10 bg-white/5 p-3">
    <h3 class="text-white font-semibold text-sm mb-1.5">Descripción</h3>
    <p class="text-sm text-white/70 leading-relaxed">
      {{ name() }} compite en la escena profesional de League of Legends.
      Fundado en {{ founded() }} y con {{ titles() }} títulos regionales, se caracteriza por su identidad competitiva.
      (Texto de ejemplo; sustituye por datos reales cuando los tengas).
    </p>
  </section>

  <!-- Plantilla por rol -->
  <section class="rounded-xl border border-white/10 bg-white/5 p-3">
    <h3 class="text-white font-semibold text-sm mb-2">Plantilla</h3>
    <div class="grid gap-3 md:grid-cols-2">
      <div *ngFor="let r of roles" class="rounded-lg border border-white/10 bg-black/20 p-3">
        <div class="flex items-center gap-2 mb-2">
          <app-role-badge [role]="r" size="sm"></app-role-badge>
          <h4 class="text-white font-semibold text-sm">{{ r }}</h4>
        </div>

        <div class="grid gap-2 sm:grid-cols-2">
          <div *ngFor="let p of byRole()[r] ?? []; trackBy: trackId"
               class="rounded-lg border border-white/10 bg-black/30 px-3 py-2">
            <div class="text-[13px] text-white font-semibold">{{ p.summonerName }}</div>
            <div class="text-[11px] text-white/60">
            Coste {{ p.cost }} • KDA {{ p.stats?.kda ?? '—' }}
            </div>
          </div>
          <div *ngIf="!(byRole()[r]?.length)" class="text-[12px] text-white/40 italic">—</div>
        </div>
      </div>
    </div>
  </section>

  <!-- Historial simple -->
  <section class="rounded-xl border border-white/10 bg-white/5 p-3">
    <h3 class="text-white font-semibold text-sm mb-2">Historial reciente</h3>
    <ul class="text-sm text-white/75 space-y-1">
      <li>• 2024 – Clasificado a Playoffs regionales</li>
      <li>• 2023 – Top 4 en liga regional</li>
      <li>• 2022 – Campeón de torneo de pretemporada</li>
    </ul>
  </section>
</section>
`
})
export class TeamDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);

  roles = ROLES;

  slug = signal('');
  name = signal('Equipo');
  region = signal('—');
  logoUrl = signal('');
  founded = signal(2019);
  titles = signal(0);

  players = signal<Player[]>([]);
  byRole = signal<Record<Role, Player[]>>({ TOP:[],JUNGLE:[],MID:[],ADC:[],SUPPORT:[] });
  totalCost = computed(() => this.players().reduce((s,p)=> s + (p.cost ?? 0), 0));

  ready = signal(false);

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug') ?? '';
    this.slug.set(slug);

    // Derivar nombre de equipo desde el slug (ej: g2-esports -> G2 Esports)
    const pretty = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    this.name.set(pretty);
    this.logoUrl.set(`/assets/teams/${slug}.png`);

    // Cargamos jugadores y filtramos por equipo (por nombre normalizado)
    this.api.getPlayers$().subscribe(list => {
      const sameTeam = list.filter(p => slugify(p.team?.name || '') === slug);
      this.players.set(sameTeam);
      this.region.set(sameTeam[0]?.team?.region || '—');

      const grouped: Record<Role, Player[]> = { TOP:[],JUNGLE:[],MID:[],ADC:[],SUPPORT:[] };
      for (const p of sameTeam) grouped[p.role as Role].push(p);
      for (const r of this.roles) grouped[r].sort((a,b)=> a.summonerName.localeCompare(b.summonerName));
      this.byRole.set(grouped);

      this.ready.set(true);
    });
  }

onImgError(e: Event) {
  const el = e.target as HTMLImageElement;
  el.src = '/src/assets/placeholder.png';
}

  trackId = (_: number, p: Player) => p.id;
}

/* helpers */
function slugify(s: string) {
  return s.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[^a-z0-9]+/g,'-')
    .replace(/(^-|-$)/g,'');
}
