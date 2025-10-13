import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { ApiService, Player } from '../../core/services/api.service';
import { RoleBadgeComponent } from '../../shared/role-badge/role-badge.component';

@Component({
  standalone: true,
  imports: [NgIf, RouterLink, RoleBadgeComponent],
  template: `
    <section *ngIf="player; else loading" class="space-y-6">
      <a routerLink="/players" class="text-sm text-sky-400 hover:underline">← Volver a jugadores</a>

      <div class="card p-6">
        <div class="flex items-center gap-5">
          <img [src]="player.photoUrl || 'https://placehold.co/120x120'"
               class="w-24 h-24 rounded-2xl object-cover ring-2 ring-white/10" />
          <div class="grow">
            <h1 class="text-2xl font-bold">{{ player.summonerName }}</h1>
            <div class="text-gray-400">{{ player.team.name }}</div>
            <div class="mt-2 flex items-center gap-2">
              <app-role-badge [role]="player.role" />
              <span class="px-2 py-0.5 text-sm rounded-xl bg-amber-500/15 text-amber-300 border border-amber-500/20">
                Coste: {{ player.cost }}
              </span>
            </div>
          </div>
        </div>

        <div class="mt-6 grid sm:grid-cols-4 gap-3">
          <div class="bg-black/25 rounded-xl p-3">
            <div class="text-[11px] text-gray-400">KDA</div>
            <div class="text-lg font-semibold">{{ player.stats?.kda ?? '—' }}</div>
          </div>
          <div class="bg-black/25 rounded-xl p-3">
            <div class="text-[11px] text-gray-400">KPR</div>
            <div class="text-lg font-semibold">{{ player.stats?.kpr ?? '—' }}</div>
          </div>
          <div class="bg-black/25 rounded-xl p-3">
            <div class="text-[11px] text-gray-400">DPM</div>
            <div class="text-lg font-semibold">{{ player.stats?.dpm ?? '—' }}</div>
          </div>
          <div class="bg-black/25 rounded-xl p-3">
            <div class="text-[11px] text-gray-400">CS/m</div>
            <div class="text-lg font-semibold">{{ player.stats?.cspm ?? '—' }}</div>
          </div>
        </div>
      </div>
    </section>

    <ng-template #loading>
      <div class="text-sm text-gray-400">Cargando jugador…</div>
    </ng-template>
  `
})
export class PlayerDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  player: Player | null = null;

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.getPlayer$(id).subscribe(p => this.player = p);
  }
}
