import { Injectable, inject, signal } from '@angular/core';
import { ApiService, MyTeam } from '../../core/services/api.service';

@Injectable({ providedIn: 'root' })
export class MyTeamStore {
  private api = inject(ApiService);

  // Estado
  team    = signal<MyTeam | null>(null);
  loading = signal(false);
  error   = signal<string | null>(null);

  /** Permite setear el equipo desde fuera (p.ej. tras buy/sell) */
  setTeam(t: MyTeam) { this.team.set(t); }

  /** Carga el equipo desde la API */
  load() {
    this.loading.set(true);
    this.error.set(null);

    this.api.getMyTeam$().subscribe({
      next: (t) => { this.team.set(t); this.loading.set(false); },
      error: () => { this.error.set('No se pudo cargar tu equipo'); this.loading.set(false); }
    });
  }

  /** Compra (asigna) un jugador a un slot */
  buy(slotId: number, playerId: number) {
    this.error.set(null);
    this.api.buyPlayer(slotId, playerId).subscribe({
      next: (t) => this.team.set(t),
      error: (e) => this.error.set(e?.error ?? 'No se pudo comprar')
    });
  }

  /** Vende (vacía) un slot */
  sell(slotId: number) {
    this.error.set(null);
    this.api.sellPlayer(slotId).subscribe({
      next: (t) => this.team.set(t),
      error: (e) => this.error.set(e?.error ?? 'No se pudo vender')
    });
  }
}
