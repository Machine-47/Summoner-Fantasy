// src/app/features/teams/teams.page.ts
import { Component, OnInit, inject } from '@angular/core';
import { ApiService, TeamInfo } from '../../core/services/api.service';
import { RouterLink } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlayersStore } from '../players/players.store';

@Component({
  standalone: true,
  imports: [NgFor, NgIf, RouterLink, FormsModule],
  template: `
    <section class="space-y-6">
      <h2 class="text-2xl font-bold">Equipos</h2>

      <div class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        <a *ngFor="let t of teams"
           [routerLink]="['/players']"
           [queryParams]="{ team: t.name }"
           class="card p-4 hover:translate-y-[-2px] transition">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-white/5 grid place-items-center text-sm">
              {{ initials(t.name) }}
            </div>
            <div class="min-w-0">
              <div class="font-semibold truncate">{{ t.name }}</div>
              <div class="text-xs text-gray-400">{{ t.count }} jugadores</div>
            </div>
          </div>
        </a>
      </div>

      <div *ngIf="loading" class="text-sm text-gray-400">Cargando equipos…</div>
      <div *ngIf="!loading && !teams.length" class="text-sm text-gray-400">No hay equipos.</div>
    </section>
  `
})
export class TeamsPage implements OnInit {
  private api = inject(ApiService);
  private playersStore = inject(PlayersStore);

  teams: TeamInfo[] = [];
  loading = false;

  ngOnInit() {
    this.loading = true;
    this.api.getTeams$().subscribe({
      next: t => { this.teams = t; this.loading = false; },
      error: () => {
        // Fallback: si el endpoint fallara, generamos desde jugadores cargados
        const list = this.playersStore.players();
        if (list.length) {
          const m = new Map<string, number>();
          list.forEach(p => m.set(p.team.name, (m.get(p.team.name)||0)+1));
          this.teams = [...m].map(([name,count])=>({name, count}));
        }
        this.loading = false;
      }
    });
  }

  initials(name: string) {
    return name.split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase();
  }
}
