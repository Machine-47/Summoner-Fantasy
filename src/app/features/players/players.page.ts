import { Component, OnInit, inject } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { PlayersStore } from './players.store';
import { SearchBarComponent } from '../../shared/search-bar/search-bar.component';
import { RoleBadgeComponent } from '../../shared/role-badge/role-badge.component';
import { MyTeamStore } from '../my-team/my-team.store';
import { Player } from '../../core/services/api.service';

@Component({
  standalone: true,
  selector: 'app-players-page',
  imports: [NgFor, NgIf, RouterLink, FormsModule, SearchBarComponent, RoleBadgeComponent],
  template: `
    <section class="space-y-6 animate-fade-up">

      <!-- Header -->
      <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 class="page-title bebas">Jugadores</h1>
          <p class="subtle">Filtra por rol, equipo o coste y ficha a tus favoritos.</p>
        </div>

        <div class="hidden sm:flex items-center gap-2">
          <span class="chip bg-white/5">
            Presupuesto:
            <span class="ml-1 font-semibold" style="color:#A54CFF">
              {{ teamStore.team()?.budget ?? 0 }}
            </span>
          </span>
          <a routerLink="/my-team" class="btn btn-brand">Mi equipo</a>
        </div>
      </div>

      <!-- Filtros (sticky) -->
      <div class="card sticky top-[4.25rem] z-20 backdrop-blur-sm p-3">
        <div class="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div class="grow">
            <app-search-bar
              [value]="store.query()"
              (valueChange)="store.query.set($event)"
              placeholder="Busca por jugador o equipo">
            </app-search-bar>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 lg:w-[520px]">
            <!-- Equipo -->
            <select class="select"
                    [ngModel]="store.team()"
                    (ngModelChange)="store.team.set($event)">
              <option value="ALL">Equipo: Todos</option>
              <option *ngFor="let t of store.teams()" [value]="t.name">
                {{ t.name }} ({{ t.count }})
              </option>
            </select>

            <!-- Rol -->
            <select class="select"
                    [ngModel]="store.role()"
                    (ngModelChange)="store.role.set($event)">
              <option value="ALL">Rol: Todos</option>
              <option>TOP</option><option>JUNGLE</option><option>MID</option><option>ADC</option><option>SUPPORT</option>
            </select>

            <!-- Región (placeholder) -->
            <select class="select"
                    [ngModel]="store.region()"
                    (ngModelChange)="store.region.set($event)">
              <option value="ALL">Región: Todas</option>
              <option>LEC</option><option>LCK</option><option>LPL</option>
              <option>LCS</option><option>PCS</option><option>VCS</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Coste -->
      <div class="card p-4">
        <div class="flex flex-col gap-3 md:grid md:grid-cols-2 md:items-center">
          <div class="text-sm subtle">
            Coste:
            <span class="font-semibold text-ink-100">{{ store.costMinSel() }}</span>
            &nbsp;–&nbsp;
            <span class="font-semibold text-ink-100">{{ store.costMaxSel() }}</span>
          </div>

          <div class="flex items-center gap-3">
            <input type="number" class="select w-24"
                   [min]="store.minCost()" [max]="store.maxCost()"
                   [ngModel]="store.costMinSel()" (ngModelChange)="onMinCostChange($event)">

            <input type="range" class="range grow"
                   [min]="store.minCost()" [max]="store.maxCost()" [step]="1"
                   [ngModel]="store.costMinSel()"
                   (ngModelChange)="onMinCostChange($event)"
                   [style.background]="rangeBg(store.minCost(), store.maxCost(), store.costMinSel())"/>

            <input type="range" class="range grow"
                   [min]="store.minCost()" [max]="store.maxCost()" [step]="1"
                   [ngModel]="store.costMaxSel()"
                   (ngModelChange)="onMaxCostChange($event)"
                   [style.background]="rangeBg(store.minCost(), store.maxCost(), store.costMaxSel())"/>

            <input type="number" class="select w-24"
                   [min]="store.minCost()" [max]="store.maxCost()"
                   [ngModel]="store.costMaxSel()" (ngModelChange)="onMaxCostChange($event)">
          </div>
        </div>
      </div>

      <!-- Estado -->
      <div *ngIf="store.loading()" class="card p-4 animate-pulse-soft subtle">Cargando jugadores…</div>
      <div *ngIf="store.error()" class="card p-4 text-red-300 bg-red-500/10 border border-red-500/20">
        {{ store.error() }}
      </div>

      <!-- Grid -->
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        <article *ngFor="let p of store.filtered(); trackBy: trackById"
                 class="card card-hover p-4 flex flex-col gap-3">
          <div class="flex items-center gap-3">
            <img [src]="p.photoUrl || 'https://placehold.co/80x80'"
                 class="w-16 h-16 rounded-xl object-cover ring-1 ring-white/10" alt="" />

            <div class="min-w-0">
              <h3 class="player-name bebas leading-tight truncate">
                <a [routerLink]="['/players', p.id]" class="hover:underline">{{ p.summonerName }}</a>
              </h3>
              <div class="text-xs subtle truncate">{{ p.team.name }} • {{ p.team.region }}</div>
              <div class="mt-1">
                <app-role-badge [role]="p.role"></app-role-badge>
              </div>
            </div>

            <div class="ml-auto flex flex-col items-end gap-2">
              <span class="chip" style="border-color:rgba(255,122,61,.30); background:rgba(255,122,61,.10)">
                {{ p.cost }}
              </span>
              <button class="btn btn-brand"
                      (click)="onBuy(p)"
                      [disabled]="!canAfford(p.cost)">
                Comprar
              </button>
            </div>
          </div>

          <div class="grid grid-cols-4 gap-2">
            <div class="stat-pill">
              <div class="label">KDA</div>
              <div class="value">{{ p.stats?.kda ?? '—' }}</div>
            </div>
            <div class="stat-pill">
              <div class="label">KPR</div>
              <div class="value">{{ p.stats?.kpr ?? '—' }}</div>
            </div>
            <div class="stat-pill">
              <div class="label">DPM</div>
              <div class="value">{{ p.stats?.dpm ?? '—' }}</div>
            </div>
            <div class="stat-pill">
              <div class="label">CS/m</div>
              <div class="value">{{ p.stats?.cspm ?? '—' }}</div>
            </div>
          </div>
        </article>
      </div>

      <!-- Vacío -->
      <div *ngIf="!store.loading() && store.filtered().length === 0" class="card p-6 text-center subtle">
        No hay resultados para esos filtros.
      </div>

      <!-- Presupuesto móvil -->
      <div class="sm:hidden">
        <div class="chip bg-white/5">
          Presupuesto:
          <span class="ml-1 font-semibold" style="color:#A54CFF">{{ teamStore.team()?.budget ?? 0 }}</span>
        </div>
      </div>

    </section>
  `
})
export class PlayersPage implements OnInit {
  store = inject(PlayersStore);
  private route = inject(ActivatedRoute);
  teamStore = inject(MyTeamStore);

  ngOnInit() {
    this.store.load();
    this.teamStore.load(); // ⚠️ imprescindible para que “Comprar” funcione

    this.route.queryParamMap.subscribe(q => {
      const team = q.get('team');
      if (team) this.store.team.set(team);
    });
  }

  trackById = (_: number, p: Player) => p.id;

  canAfford(cost: number) {
    const budget = this.teamStore.team()?.budget ?? 0;
    return budget >= cost;
  }

  onBuy(p: Player) {
    const team = this.teamStore.team();
    if (!team) { this.teamStore.load(); return; }

    const slot = team.slots.find(s => s.role === p.role && !s.playerId);
    if (!slot) { alert(`No tienes hueco libre en ${p.role}`); return; }

    this.teamStore.buy(slot.id, p.id);
  }

  // --- Sliders robustos (no se cruzan) + fondo relleno
  onMinCostChange(val: number) {
    const v = Math.max(this.store.minCost(), Math.min(Number(val), this.store.costMaxSel()));
    this.store.costMinSel.set(v);
  }
  onMaxCostChange(val: number) {
    const v = Math.min(this.store.maxCost(), Math.max(Number(val), this.store.costMinSel()));
    this.store.costMaxSel.set(v);
  }
  rangeBg(min: number, max: number, val: number) {
  // morado #870a95 -> rgb(135,10,149)
  const pct = (val - min) * 100 / Math.max(1, (max - min));
  return `linear-gradient(to right,
            rgba(135,10,149,.35) 0%,
            rgba(135,10,149,.35) ${pct}%,
            rgba(255,255,255,.08) ${pct}%,
            rgba(255,255,255,.08) 100%)`;
}
}
