import { Component, OnInit, inject, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { LeaguesService, League } from './leagues.service';
import { ApiService, Player, MyTeam } from '../../core/services/api.service';
import { firstValueFrom } from 'rxjs';

type Role = 'TOP'|'JUNGLE'|'MID'|'ADC'|'SUPPORT';
const ROLES: Role[] = ['TOP','JUNGLE','MID','ADC','SUPPORT'];

@Component({
  standalone: true,
  selector: 'app-league-detail',
  imports: [NgIf, NgFor, RouterLink],
  template: `
<section class="px-4 md:px-8 py-8 space-y-6" *ngIf="league; else notFound">
  <a routerLink="/leagues" class="text-sm text-white/70 hover:text-white">&larr; Volver a Ligas</a>

  <header class="space-y-2">
    <div class="text-xs font-semibold text-white/70 uppercase tracking-wide">{{ league!.badge }}</div>
    <h1 class="text-3xl md:text-4xl font-black tracking-tight text-white">{{ league!.title }}</h1>
    <p class="text-white/60">{{ league!.subtitle }}</p>
    <div class="text-sm text-white/70">
      {{ league!.mode === 'pickem' ? 'Modo Pick’em' : 'Modo Draft' }}
    </div>
  </header>

  <div class="flex gap-3">
    <button [routerLink]="['/leagues', league!.slug, 'draft']"
            class="inline-flex items-center justify-center rounded-xl px-5 py-2.5 bg-[#7d0c87] hover:bg-[#8d1398] text-white font-semibold">
      Comenzar
    </button>
  </div>

  <!-- MODAL -->
  <div *ngIf="modalOpen()" class="fixed inset-0 z-50">
    <div class="absolute inset-0 bg-black/60" (click)="closeDraft()"></div>

    <div class="absolute inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2
                bg-[#121212] border border-white/10 rounded-t-3xl md:rounded-2xl shadow-2xl w-full md:w-[1000px]">
      <header class="flex items-center justify-between px-4 md:px-6 py-4 border-b border-white/10">
        <h2 class="text-lg font-bold text-white">Elige tus jugadores</h2>
        <button (click)="closeDraft()" class="text-white/70 hover:text-white text-xl leading-none">&times;</button>
      </header>

      <!-- Mobile: tabs -->
      <div class="block md:hidden px-4 pt-3">
        <div class="flex gap-2 overflow-x-auto no-scrollbar">
          <button *ngFor="let r of roles"
                  (click)="activeRole.set(r)"
                  class="px-3 py-1.5 rounded-full text-sm border"
                  [class.bg-white/15]="activeRole()===r"
                  [class.border-white/30]="activeRole()===r"
                  [class.text-white]="activeRole()===r"
                  [class.border-white/10]="activeRole()!==r"
                  [class.text-white/60]="activeRole()!==r">
            {{ r }}
          </button>
        </div>
      </div>

      <div class="p-4 md:p-6">
        <!-- Columnas -->
        <div class="grid gap-4 md:grid-cols-5">
          <ng-container *ngFor="let role of roles">
            <section *ngIf="roleVisible(role)" class="rounded-xl border border-white/10 bg-white/5">
              <header class="px-3 py-2 border-b border-white/10 flex items-center justify-between">
                <h3 class="text-sm font-semibold text-white">{{ role }}</h3>
                <span class="text-xs text-white/60">Seleccionado:
                  <span class="text-white font-semibold">{{ selected()[role]?.summonerName || '—' }}</span>
                </span>
              </header>

              <div class="max-h-[42vh] md:max-h-[56vh] overflow-auto divide-y divide-white/5">
                <label *ngFor="let p of players()[role]; trackBy: trackId"
                       class="flex items-center gap-3 px-3 py-2 hover:bg-white/10 cursor-pointer">
                  <input type="radio"
                         class="accent-[#7d0c87]"
                         [name]="'role-'+role"
                         [checked]="selected()[role]?.id === p.id"
                         (change)="pick(role, p)">
                  <div class="min-w-0">
                    <div class="text-sm font-medium text-white truncate">{{ p.summonerName }}</div>
                    <div class="text-xs text-white/60 truncate">{{ p.team.name }} • {{ p.team.region }}</div>
                  </div>
                  <div class="ml-auto flex items-center gap-3">
                    <span class="text-xs text-white/70">Coste <span class="text-white font-semibold">{{ p.cost }}</span></span>
                  </div>
                </label>
                <div *ngIf="!players()[role]?.length" class="px-3 py-3 text-xs text-white/60">
                  No hay jugadores para {{ role }}.
                </div>
              </div>
            </section>
          </ng-container>
        </div>

        <footer class="mt-4 md:mt-6 flex flex-col md:flex-row items-stretch md:items-center justify-end gap-2">
          <button (click)="closeDraft()"
                  class="rounded-xl px-4 py-2 border border-white/15 bg-black/30 text-white hover:bg-black/40">
            Cancelar
          </button>
          <button (click)="confirm()"
                  [disabled]="confirming()"
                  class="rounded-xl px-4 py-2 bg-[#7d0c87] hover:bg-[#8d1398] text-white font-semibold disabled:opacity-60">
            {{ confirming() ? 'Guardando…' : 'Confirmar selección' }}
          </button>
        </footer>
      </div>
    </div>
  </div>
</section>

<ng-template #notFound>
  <section class="px-4 md:px-8 py-8">
    <a routerLink="/leagues" class="text-sm text-white/70 hover:text-white">&larr; Volver a Ligas</a>
    <div class="mt-4 text-white/80">Liga no encontrada.</div>
  </section>
</ng-template>
`
})
export class LeagueDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private svc = inject(LeaguesService);
  private api = inject(ApiService);
  private router = inject(Router);

  league?: League;

  // UI state
  modalOpen = signal(false);
  confirming = signal(false);

  roles: Role[] = ROLES;
  activeRole = signal<Role>('TOP');

  // Data
  players = signal<Record<Role, Player[]>>({ TOP: [], JUNGLE: [], MID: [], ADC: [], SUPPORT: [] });
  selected = signal<Record<Role, Player | null>>({ TOP: null, JUNGLE: null, MID: null, ADC: null, SUPPORT: null });

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug') ?? '';
    this.league = this.svc.getBySlug(slug);
  }

  openDraft() {
    this.modalOpen.set(true);
    this.loadPlayersByRole();
  }
  closeDraft() { this.modalOpen.set(false); }

  roleVisible(r: Role) {
    return (window.innerWidth >= 768) || this.activeRole() === r;
  }

async loadPlayersByRole() {
  // Pide TODO sin filtros (una sola llamada) y agrupa por rol en cliente
  this.api.getPlayers$().subscribe({
    next: (arr) => {
      const grouped: Record<Role, Player[]> = { TOP: [], JUNGLE: [], MID: [], ADC: [], SUPPORT: [] };
      for (const p of arr) {
        // Normaliza defensivo por si acaso
        const r = (p.role || 'MID') as Role;
        if (grouped[r]) grouped[r].push(p);
      }
      this.players.set(grouped);
    },
    error: (err) => {
      console.error('Error cargando jugadores:', err);
      // deja vacío si falla
      this.players.set({ TOP: [], JUNGLE: [], MID: [], ADC: [], SUPPORT: [] });
    }
  });
}

  pick(role: Role, p: Player) {
    const cur = { ...this.selected() };
    cur[role] = p;
    this.selected.set(cur);
  }


async confirm() {
  try {
    this.confirming.set(true);

    // 1) Obtener equipo actual para mapear rol -> slotId (y saber si hay jugador ya asignado)
    const myTeam = await firstValueFrom(this.api.getMyTeam$());
    const slotIdByRole = new Map<Role, number>();
    const currentPlayerByRole = new Map<Role, number | null>();

    for (const s of myTeam.slots) {
      const r = s.role as Role;
      slotIdByRole.set(r, s.id);
      currentPlayerByRole.set(r, s.playerId ?? null);
    }

    // 2) Procesar cada rol seleccionado
    for (const role of this.roles) {
      const chosen = this.selected()[role];
      if (!chosen) continue; // rol no elegido

      const slotId = slotIdByRole.get(role);
      if (!slotId) continue;

      const currentPlayerId = currentPlayerByRole.get(role);

      // Si ya hay jugador en el slot, primero vender
      if (currentPlayerId && currentPlayerId !== chosen.id) {
        await firstValueFrom(this.api.sellPlayer(slotId));
      }

      // Comprar el seleccionado (si no estaba ya)
      if (currentPlayerId !== chosen.id) {
        await firstValueFrom(this.api.buyPlayer(slotId, chosen.id));
      }
    }

    this.modalOpen.set(false);
    this.confirming.set(false);

    // 3) Navegar a Mi Equipo para ver el resultado
    await this.router.navigateByUrl('/my-team');

  } catch (err) {
    console.error(err);
    this.confirming.set(false);
  }
}

  trackId = (_: number, p: Player) => p.id;
}
