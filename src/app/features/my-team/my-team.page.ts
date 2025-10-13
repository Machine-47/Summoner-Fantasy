// src/app/features/my-team/my-team.page.ts
import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MyTeamStore } from './my-team.store';
import { ApiService, Player, MyTeam } from '../../core/services/api.service';

type Role = 'TOP'|'JUNGLE'|'MID'|'ADC'|'SUPPORT';

@Component({
  standalone: true,
  selector: 'app-my-team',
  imports: [NgFor, NgIf, NgClass, RouterLink],
  template: `
    <section class="space-y-6 animate-fade-up">
      <!-- Header -->
      <div class="flex items-center justify-between gap-3">
        <h1 class="page-title text-[2.6rem] sm:text-[3.1rem] tracking-[.08em]">
          Mi equipo
        </h1>

        <div class="flex items-center gap-2">
          <div class="chip bebas tracking-[.1em]">
            Presupuesto:
            <span class="ml-2 font-semibold">{{ team()?.budget ?? 0 }}</span>
          </div>
          <a routerLink="/players" class="btn btn-minimal">Comprar jugadores</a>
        </div>
      </div>

      <!-- Estado -->
      <div *ngIf="store.loading()" class="text-sm text-white/70">Cargando tu equipo…</div>
      <div *ngIf="store.error()"   class="text-sm text-red-300">{{ store.error() }}</div>

      <!-- Mapa con slots -->
      <div class="card relative overflow-hidden max-w-6xl mx-auto aspect-[16/9]">
        <img src="/assets/rift.png"
          alt="Summoner's Rift"
          class="absolute inset-0 w-full h-full object-cover opacity-35">
        <div class="absolute inset-0">
          <!-- Pines por rol -->
          <button
            *ngFor="let pin of pinDefs"
            type="button"
            class="slot-pin"
            [style.top.%]="pin.top"
            [style.left.%]="pin.left"
            (click)="openPicker(pin.role)"
            [title]="pin.role">

            <!-- Con jugador -->
            <ng-container *ngIf="getPlayerByRole(pin.role) as player; else emptySlot">
              <img *ngIf="player.photoUrl"
                   [src]="player.photoUrl"
                   class="h-11 w-11 rounded-full object-cover ring-2 ring-white/20">
              <div *ngIf="!player.photoUrl"
                   class="h-11 w-11 rounded-full bg-white/10 grid place-items-center text-white/90 ring-2 ring-white/20">
                <span class="font-semibold">{{ player.summonerName?.[0] ?? 'P' }}</span>
              </div>

              <div class="text-[11px] bebas tracking-[.08em] mt-1 px-2 py-0.5 rounded-full"
                   [ngClass]="roleColor(pin.role)">
                {{ pin.role }}
              </div>

              <div class="name-chip">
                <span class="truncate block max-w-[8.5rem]">{{ player.summonerName }}</span>
                <span class="text-[10px] text-white/60 block truncate">{{ player.team.name }}</span>
              </div>
            </ng-container>

            <!-- Vacío -->
            <ng-template #emptySlot>
              <div class="h-11 w-11 rounded-full bg-white/8 border border-white/15 grid place-items-center">
                <svg class="w-5 h-5 text-white/70" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 5v14m-7-7h14"/>
                </svg>
              </div>
              <div class="text-[11px] bebas tracking-[.08em] mt-1 px-2 py-0.5 rounded-full"
                   [ngClass]="roleColor(pin.role)">
                {{ pin.role }}
              </div>
              <div class="text-[10px] text-white/60 mt-1">Asignar</div>
            </ng-template>
          </button>
        </div>
      </div>

      <!-- Picker bottom-sheet -->
      <div *ngIf="pickerOpen()" class="fixed inset-0 z-50">
        <div class="absolute inset-0 bg-black/50" (click)="closePicker()"></div>

        <div class="absolute bottom-0 left-0 right-0 bg-black/85 backdrop-blur-xl
                    border-t border-white/10 rounded-t-2xl p-4 max-h-[60vh] overflow-auto">
          <div class="flex items-center justify-between mb-2">
            <div class="bebas tracking-[.1em] text-[1.4rem]">
              {{ pickerRole() }} • Selecciona jugador
            </div>
            <button class="text-white/70 hover:text-white" (click)="closePicker()">Cerrar</button>
          </div>

          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div *ngFor="let p of candidates()" class="bg-white/5 rounded-xl border border-white/10 p-3 flex items-center gap-3">
              <img *ngIf="p.photoUrl" [src]="p.photoUrl" class="h-10 w-10 rounded-xl object-cover ring-2 ring-white/10">
              <div *ngIf="!p.photoUrl" class="h-10 w-10 rounded-xl bg-white/8 grid place-items-center">🧑‍🎮</div>

              <div class="min-w-0 grow">
                <div class="player-name text-[1.1rem] truncate">{{ p.summonerName }}</div>
                <div class="text-xs text-white/60 truncate">{{ p.team.name }} • {{ p.role }}</div>
              </div>

              <button class="btn btn-brand" (click)="assignToCurrentSlot(p.id)">Asignar</button>
            </div>

            <div *ngIf="!loadingCandidates() && candidates().length === 0" class="text-sm text-white/60">
              No hay jugadores disponibles para {{ pickerRole() }}.
            </div>
            <div *ngIf="loadingCandidates()" class="text-sm text-white/70">Cargando…</div>
          </div>

          <div class="mt-3">
            <button class="btn btn-ghost" (click)="clearCurrentSlot()">Quitar jugador del rol</button>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .slot-pin{
      position:absolute;
      transform:translate(-50%,-50%);
      display:flex;
      flex-direction:column;
      align-items:center;
      color:#fff;
      gap:4px;
    }
    .name-chip{
      margin-top:4px;
      font-size:.72rem;
      background:rgba(255,255,255,.08);
      border:1px solid rgba(255,255,255,.12);
      color:#fff;
      padding:.2rem .5rem;
      border-radius:.6rem;
      max-width: 9.5rem;
    }
    /* Colores de rol */
    .role-top    { background:rgba(254,215,170,.12); border:1px solid rgba(254,215,170,.25); }
    .role-jg     { background:rgba(134,239,172,.12); border:1px solid rgba(134,239,172,.25); }
    .role-mid    { background:rgba(147,197,253,.12); border:1px solid rgba(147,197,253,.25); }
    .role-adc    { background:rgba(252,165,165,.12); border:1px solid rgba(252,165,165,.25); }
    .role-sup    { background:rgba(196,181,253,.12); border:1px solid rgba(196,181,253,.25); }
  `]
})
export class MyTeamPage implements OnInit {
  store = inject(MyTeamStore);
  api   = inject(ApiService);

  // Posiciones (en % sobre 16:9)
  pinDefs = [
    { role: 'TOP'     as Role, top: 18, left: 26 },
    { role: 'JUNGLE'  as Role, top: 38, left: 38 },
    { role: 'MID'     as Role, top: 50, left: 50 },
    { role: 'ADC'     as Role, top: 64, left: 64 },
    { role: 'SUPPORT' as Role, top: 76, left: 54 },
  ];

  // Picker
  pickerOpen          = signal(false);
  pickerRole          = signal<Role>('TOP');
  private _candidates = signal<Player[]>([]);
  loadingCandidates   = signal(false);
  candidates          = computed(() => this._candidates());

  // Derivados
  team  = computed(() => this.store.team());
  slots = computed(() => this.store.team()?.slots ?? []);

  ngOnInit() {
    if (!this.store.team()) {
      this.store.load();
    }
  }

  /** Jugador asignado a un rol, o null */
  getPlayerByRole(role: Role): Player | null {
    const t = this.team();
    if (!t) return null;
    const slot = t.slots.find(s => s.role === role);
    if (!slot || !slot.player) return null;

    // Adaptamos el shape embebido de MyTeam a Player (por si no trae photo/team.region)
    const p = slot.player;
    return {
      id: p.id,
      summonerName: p.name,
      role: (p.role.toUpperCase() as Role).replace('BOT', 'ADC') as Role,
      team: { name: p.team, region: '—' },
      cost: p.cost
    };
  }

  /** Abre picker y carga candidatos del rol */
  openPicker(role: Role) {
    this.pickerRole.set(role);
    this.loadingCandidates.set(true);
    this._candidates.set([]);

    this.api.getPlayers$({ role }).subscribe({
      next: (list) => { this._candidates.set(list); this.loadingCandidates.set(false); this.pickerOpen.set(true); },
      error: ()     => { this.loadingCandidates.set(false); this.pickerOpen.set(true); }
    });
  }

  closePicker() {
    this.pickerOpen.set(false);
  }

  /** Asignar jugador seleccionado del picker al slot del rol actual */
  assignToCurrentSlot(playerId: number) {
    const t = this.team();
    if (!t) return;
    const role = this.pickerRole();
    const slot = t.slots.find(s => s.role === role);
    if (!slot) return;

    this.store.buy(slot.id, playerId);
    this.closePicker();
  }

  /** Vacía el slot del rol actual */
  clearCurrentSlot() {
    const t = this.team();
    if (!t) return;
    const role = this.pickerRole();
    const slot = t.slots.find(s => s.role === role);
    if (!slot?.id) return;

    this.store.sell(slot.id);
    this.closePicker();
  }

  /** Clase de color por rol */
  roleColor(role: Role) {
    switch (role) {
      case 'TOP':     return 'role-top';
      case 'JUNGLE':  return 'role-jg';
      case 'MID':     return 'role-mid';
      case 'ADC':     return 'role-adc';
      case 'SUPPORT': return 'role-sup';
    }
  }
}
