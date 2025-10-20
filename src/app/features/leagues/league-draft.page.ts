import { Component, OnInit, inject, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { LeaguesService, League } from './leagues.service';
import { ApiService, Player, MyTeam } from '../../core/services/api.service';

type Role = 'TOP'|'JUNGLE'|'MID'|'ADC'|'SUPPORT';
const ROLES: Role[] = ['TOP','JUNGLE','MID','ADC','SUPPORT'];

// ==== Presupuesto ====
const BUDGET = 15;
const UNIT = 'oro';   // <- cambia a '$', 'coins', etc. si lo prefieres

function tierLabel(cost: number): string {
  switch (cost) { case 5: return 'S+'; case 4: return 'S'; case 3: return 'A'; case 2: return 'B'; case 1: return 'C'; default: return `T${cost}`; }
}

@Component({
  standalone: true,
  selector: 'app-league-draft',
  imports: [NgIf, NgFor, RouterLink],
  template: `
<section class="px-3 md:px-6 py-4 space-y-3">
  <!-- Top bar -->
  <div class="flex items-center justify-between gap-3">
    <a [routerLink]="['/leagues', slug]" class="text-xs text-white/60 hover:text-white">&larr; Volver</a>
    <div class="text-xs text-white/50">{{ league?.badge }}</div>
  </div>

  <header class="space-y-0.5">
    <h1 class="text-xl md:text-2xl font-extrabold tracking-tight text-white font-display">
      Draft: {{ league?.title || 'Liga' }}
    </h1>
    <p class="text-xs text-white/60">Crea tu equipo y compite por puntos</p>
  </header>

  <!-- Resumen + Confirmar (ARRIBA) -->
  <div class="rounded-lg border border-white/10 bg-white/5 px-3 py-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
    <div class="flex items-center gap-4">
      <div class="text-xs text-white/70">
        Seleccionados: <span class="text-white font-semibold">{{ selectedCount() }}/5</span>
      </div>
      <div class="text-xs text-white/70">
        Presupuesto: <span class="text-white font-semibold">{{ spent() }}</span> / {{ budget }} {{ unit }}
        <span class="ml-2" [class.text-rose-400]="remaining() < 0" [class.text-white/70]="remaining() >= 0">
          Restante: <span class="font-semibold" [class.text-white]="remaining() >= 0">{{ remaining() }}</span> {{ unit }}
        </span>
      </div>
    </div>

    <div class="flex items-center gap-3">
      <div class="h-1.5 w-40 rounded bg-white/10 overflow-hidden">
        <div class="h-full transition-all"
             [class.bg-[#7d0c87]]="remaining() >= 0"
             [class.bg-rose-500]="remaining() < 0"
             [style.width.%]="(spent()/budget)*100"></div>
      </div>

      <button (click)="confirm()"
              [disabled]="confirming() || !canConfirm()"
              class="rounded-lg px-3 py-1.5 bg-[#7d0c87] hover:bg-[#8d1398] text-white font-semibold text-sm disabled:opacity-60">
        {{ confirming() ? 'Guardando…' : 'Confirmar ('+selectedCount()+'/5)' }}
      </button>
    </div>
  </div>

  <!-- MATRIZ TIER x ROL -->
  <div class="rounded-xl border border-white/10 overflow-hidden">
    <!-- Cabecera de roles (con coste seleccionado) -->
    <div class="grid text-[11px]" [style.gridTemplateColumns]="'110px repeat(5, 1fr)'">
      <div class="bg-white/5 px-3 py-2 font-semibold text-white/70 uppercase tracking-wide">Tier</div>

      <div *ngFor="let r of roles" class="bg-white/5 px-3 py-2 font-semibold text-white/70 uppercase tracking-wide text-center">
        <span>{{ r }}</span>
        <span *ngIf="selected()[r]?.cost"
              class="ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold bg-white/10 text-white/80 border border-white/10">
          {{ selected()[r]?.cost }} {{ unit }}
        </span>
      </div>
    </div>

    <!-- Filas por tier -->
    <ng-container *ngFor="let c of tiers()">
      <div class="grid border-t border-white/10 py-2" [style.gridTemplateColumns]="'110px repeat(5, 1fr)'">
        <!-- Etiqueta Tier -->
        <div class="px-3 py-2 text-[12px] font-semibold text-white/80 flex items-center">
          {{ tierLabelMap()[c] }} <span class="ml-1 text-white/40">({{ c }})</span>
        </div>

        <!-- Celdas de rol -->
        <ng-container *ngFor="let r of roles">
          <div class="px-2 py-2">
            <div class="grid gap-2 grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
              <!-- FICHA -->
              <div *ngFor="let p of byRoleCost()[r]?.[c] ?? []; trackBy: trackId"
                   (click)="tryToggle(r, p)"
                   class="group relative flex items-center justify-center text-center
                          rounded-xl bg-white/5 hover:bg-white/10 transition
                          px-3 h-[44px] cursor-pointer select-none"
                   [class.bg-[#7d0c87]/15]="isSelected(r, p)"
                   [class.ring-2]="isSelected(r, p)"
                   [class.ring-[#7d0c87]]="isSelected(r, p)"
                   [class.shadow-[0_0_0_1px_rgba(125,12,135,0.28),0_0_18px_rgba(125,12,135,0.25)]]="isSelected(r, p)"
                   [class.scale-[1.015]]="isSelected(r, p)"
                   [class.opacity-40]="isDisabled(r, p)"
                   [class.pointer-events-none]="isDisabled(r, p)"
                   [attr.aria-pressed]="isSelected(r, p)"
                   role="button"
                   [title]="isDisabled(r,p) ? 'No hay presupuesto suficiente' : ''">
                <span class="font-display font-medium tracking-wide text-[14px] md:text-[15px] text-white leading-[1.05]
                             max-w-full line-clamp-2 break-words">
                  {{ p.summonerName }}
                </span>

                <!-- Tooltip (desktop) -->
                <div class="hidden md:block absolute z-10 left-1/2 -translate-x-1/2 -top-2 -translate-y-full
                            opacity-0 group-hover:opacity-100 transition pointer-events-none">
                  <div class="rounded-lg border border-white/10 bg-black/90 text-[12px] text-white px-2 py-1 shadow-xl whitespace-nowrap">
                    <span class="font-semibold">{{ p.summonerName }}</span>
                    <span class="text-white/60"> • {{ r }}</span>
                    <span *ngIf="p.team?.name" class="text-white/60"> • {{ p.team.name }}</span>
                    <span class="text-white/60"> • coste {{ p.cost }} {{ unit }}</span>
                    <span class="text-white/60"> • KDA: {{ p.stats?.kda ?? '—' }}</span>
                  </div>
                </div>
              </div>

              <!-- Vacío -->
              <div *ngIf="!(byRoleCost()[r]?.[c]?.length)"
                   class="text-[11px] text-white/35 italic select-none px-1.5 py-1">—</div>
            </div>
          </div>
        </ng-container>
      </div>
    </ng-container>
  </div>

  <!-- Aviso presupuesto -->
  <div *ngIf="warning()" class="text-[12px] text-rose-400">
    {{ warning() }}
  </div>
</section>
`
})
export class LeagueDraftPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private leagues = inject(LeaguesService);
  private api = inject(ApiService);

  slug = '';
  league?: League;

  roles: Role[] = ROLES;
  budget = BUDGET;
  unit = UNIT;
  confirming = signal(false);
  warning = signal<string | null>(null);

  // Datos agrupados
  tiers = signal<number[]>([]);
  tierLabelMap = signal<Record<number,string>>({});
  byRoleCost = signal<Record<Role, Record<number, Player[]>>>({
    TOP: {}, JUNGLE: {}, MID: {}, ADC: {}, SUPPORT: {}
  });

  // Selección por rol
  selected = signal<Record<Role, Player | null>>({
    TOP: null, JUNGLE: null, MID: null, ADC: null, SUPPORT: null
  });

  ngOnInit() {
    this.slug = this.route.snapshot.paramMap.get('slug') ?? '';
    this.league = this.leagues.getBySlug(this.slug);
    this.loadPlayersAll();
  }

  loadPlayersAll() {
    this.api.getPlayers$().subscribe({
      next: (arr) => {
        const costs = Array.from(new Set(arr.map(p => p.cost))).sort((a,b)=>b-a);
        this.tiers.set(costs);
        const labels: Record<number,string> = {};
        for (const c of costs) labels[c] = tierLabel(c);
        this.tierLabelMap.set(labels);

        const grouped: Record<Role, Record<number, Player[]>> = { TOP: {}, JUNGLE: {}, MID: {}, ADC: {}, SUPPORT: {} };
        for (const p of arr) {
          const r = (p.role || 'MID') as Role;
          const c = p.cost ?? 0;
          (grouped[r][c] ||= []).push(p);
        }
        for (const r of this.roles) for (const c of costs) grouped[r][c]?.sort((a,b)=> a.summonerName.localeCompare(b.summonerName));
        this.byRoleCost.set(grouped);
      },
      error: () => {
        this.tiers.set([]);
        this.byRoleCost.set({ TOP: {}, JUNGLE: {}, MID: {}, ADC: {}, SUPPORT: {} });
      }
    });
  }

  // ===== Presupuesto =====
  spent() {
    const s = this.selected();
    return (s.TOP?.cost ?? 0) + (s.JUNGLE?.cost ?? 0) + (s.MID?.cost ?? 0) + (s.ADC?.cost ?? 0) + (s.SUPPORT?.cost ?? 0);
  }
  remaining() { return this.budget - this.spent(); }

  // Si al cambiar ese rol, el delta supera el restante, deshabilita
  isDisabled(role: Role, p: Player) {
    const cur = this.selected()[role];
    if (cur?.id === p.id) return false; // ya seleccionado
    const delta = p.cost - (cur?.cost ?? 0);
    return delta > this.remaining();
  }

  tryToggle(role: Role, p: Player) {
    if (this.isDisabled(role, p)) {
      this.warning.set('No hay presupuesto suficiente para esta selección.');
      setTimeout(() => this.warning.set(null), 1600);
      return;
    }
    this.toggle(role, p);
  }

  // ===== UI helpers =====
  isSelected(role: Role, p: Player) { return this.selected()[role]?.id === p.id; }

  toggle(role: Role, p: Player) {
    const cur = { ...this.selected() };
    cur[role] = (cur[role]?.id === p.id) ? null : p;  // deselecciona si repites click
    this.selected.set(cur);
  }

  selectedCount() {
    const s = this.selected();
    return (s.TOP?1:0)+(s.JUNGLE?1:0)+(s.MID?1:0)+(s.ADC?1:0)+(s.SUPPORT?1:0);
  }

  canConfirm() {
    return this.selectedCount() === 5 && this.remaining() >= 0;
  }

  // ===== Confirmar (sell/buy por rol) =====
  async confirm() {
    if (!this.canConfirm()) return;
    try {
      this.confirming.set(true);

      const myTeam: MyTeam = await firstValueFrom(this.api.getMyTeam$());
      const slotIdByRole = new Map<Role, number>();
      const currentPlayerByRole = new Map<Role, number | null>();
      for (const s of myTeam.slots) {
        const r = s.role as Role;
        slotIdByRole.set(r, s.id);
        currentPlayerByRole.set(r, s.playerId ?? null);
      }

      for (const r of this.roles) {
        const choice = this.selected()[r];
        if (!choice) continue;
        const slotId = slotIdByRole.get(r);
        if (!slotId) continue;

        const current = currentPlayerByRole.get(r);
        if (current && current !== choice.id) {
          await firstValueFrom(this.api.sellPlayer(slotId));
        }
        if (current !== choice.id) {
          await firstValueFrom(this.api.buyPlayer(slotId, choice.id));
        }
      }

      this.confirming.set(false);
      await this.router.navigateByUrl('/my-team');
    } catch {
      this.confirming.set(false);
    }
  }

  trackId = (_: number, p: Player) => p.id;
}
