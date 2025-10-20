import { Component, OnInit, inject } from '@angular/core';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { MyTeamStore } from './my-team.store';

@Component({
  selector: 'app-my-team',
  standalone: true,
  imports: [NgIf, NgFor, NgClass],
  template: `
  <section class="px-4 md:px-8 py-6 space-y-6">
    <header class="space-y-2">
      <h1 class="text-3xl font-extrabold tracking-tight text-white font-display">Mi equipo</h1>
      <p class="text-sm text-white/60">Revisa tus ligas, clasificación y rendimiento por semana.</p>
    </header>

    <!-- Selector de liga -->
    <div class="rounded-xl border border-white/10 bg-black/20 p-4">
      <label class="block text-[11px] uppercase tracking-wide text-white/60 mb-2">Liga actual</label>
      <div class="flex gap-3 flex-wrap">
        <button
          *ngFor="let l of store.leagues()"
          (click)="store.selectLeague(l.id)"
          [ngClass]="store.currentLeague()?.id === l.id ? 'ring-1 ring-[#ff2e74]' : ''"
          class="px-3 py-2 rounded-lg border border-white/10 bg-black/30 text-sm hover:bg-black/40 transition">
          {{ l.name }}
          <span class="ml-2 text-white/60 text-xs">#{{ l.myRank }} · {{ l.myPointsTotal }} pts</span>
        </button>
      </div>
    </div>

    <div *ngIf="store.loading()" class="text-white/70">Cargando…</div>
    <div *ngIf="store.error()" class="text-rose-400">{{ store.error() }}</div>

    <ng-container *ngIf="store.roster() as team">
      <!-- Roster -->
      <div class="rounded-xl border border-white/10 bg-black/20 p-4">
        <h3 class="text-white font-semibold mb-3">Alineación • {{ team.name }}</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div *ngFor="let s of team.slots" class="rounded-lg border border-white/10 bg-black/30 p-3">
            <div class="text-xs uppercase tracking-wide text-white/60 mb-1">{{ s.role }}</div>
            <div class="font-medium text-white">{{ s.player.name }}</div>
            <div class="text-xs text-white/50">{{ s.player.team }}</div>
            <div class="mt-2 text-xs text-white/70">Puntos (semana): <span class="font-semibold">{{ s.pointsWeek }}</span></div>
          </div>
        </div>
        <div class="mt-4 text-sm text-white/80">
          Total semana: <span class="font-semibold">{{ team.pointsWeek }}</span> ·
          Total general: <span class="font-semibold">{{ team.pointsTotal }}</span>
        </div>
      </div>

      <!-- Panel derecho: Clasificación + Histórico -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Clasificación -->
        <div class="rounded-xl border border-white/10 bg-black/20 p-4">
          <h3 class="font-semibold text-white mb-2">Clasificación</h3>
          <div class="space-y-1">
            <div
              *ngFor="let t of store.standings(); let i = index"
              class="flex items-center justify-between rounded-lg border border-white/10 bg-black/30 px-3 py-2"
              [ngClass]="store.currentLeague()?.myRank === t.rank ? 'ring-1 ring-[#ff2e74]' : ''">
              <div class="text-sm">
                <span class="text-white/60 mr-2">#{{ t.rank }}</span>
                <span class="font-medium text-white">{{ t.user }}</span>
              </div>
              <div class="text-sm font-semibold text-white">{{ t.points }}</div>
            </div>
          </div>
        </div>

        <!-- Histórico semanal -->
        <div class="rounded-xl border border-white/10 bg-black/20 p-4">
          <h3 class="font-semibold text-white mb-2">Puntos por semana</h3>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <div *ngFor="let w of store.history()" class="rounded-lg border border-white/10 bg-black/30 px-3 py-2">
              <div class="text-xs text-white/60">Semana {{ w.week }}</div>
              <div class="text-sm font-semibold text-white">{{ w.points }}</div>
            </div>
          </div>
        </div>
      </div>
    </ng-container>
  </section>
  `,
})
export class MyTeamPage implements OnInit {
  store = inject(MyTeamStore);
  ngOnInit(): void { this.store.init(); }
}
