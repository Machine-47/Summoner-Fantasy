import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from './core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, NgIf],
  template: `
<div class="min-h-screen bg-[#0b0b0f] text-white">
  <!-- NAV -->
  <nav class="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-black/30 bg-black/50 border-b border-white/10">
    <div class="mx-auto max-w-7xl px-4 md:px-6 h-16 flex items-center justify-between">
      <!-- Logo -->
      <a routerLink="/" class="flex items-center gap-3 select-none">
        <span class="font-display text-2xl md:text-3xl font-extrabold leading-none">
          <span class="bg-gradient-to-r from-[#ff2e74] to-[#7d0c87] bg-clip-text text-transparent">Summoner</span>
          <span class="text-white"> Fantasy</span>
        </span>
      </a>

      <!-- Links centrales -->
      <div class="hidden md:flex items-center gap-6">
        <a
          routerLink="/players"
          routerLinkActive="text-white"
          #rlaPlayers="routerLinkActive"
          class="group relative text-base md:text-lg font-display font-semibold tracking-wide text-white/80 hover:text-white transition">
          <span>Jugadores</span>
          <span
            class="absolute left-0 -bottom-1 h-[2px] bg-gradient-to-r from-[#ff2e74] to-[#7d0c87] transition-all duration-300 block"
            [class.w-full]="rlaPlayers.isActive" [class.w-0]="!rlaPlayers.isActive"></span>
        </a>

        <a
          routerLink="/teams"
          routerLinkActive="text-white"
          #rlaTeams="routerLinkActive"
          class="group relative text-base md:text-lg font-display font-semibold tracking-wide text-white/80 hover:text-white transition">
          <span>Equipos</span>
          <span
            class="absolute left-0 -bottom-1 h-[2px] bg-gradient-to-r from-[#ff2e74] to-[#7d0c87] transition-all duration-300 block"
            [class.w-full]="rlaTeams.isActive" [class.w-0]="!rlaTeams.isActive"></span>
        </a>

        <a
          routerLink="/schedule"
          routerLinkActive="text-white"
          #rlaSchedule="routerLinkActive"
          class="group relative text-base md:text-lg font-display font-semibold tracking-wide text-white/80 hover:text-white transition">
          <span>Calendario</span>
          <span
            class="absolute left-0 -bottom-1 h-[2px] bg-gradient-to-r from-[#ff2e74] to-[#7d0c87] transition-all duration-300 block"
            [class.w-full]="rlaSchedule.isActive" [class.w-0]="!rlaSchedule.isActive"></span>
        </a>

        <a
          routerLink="/leagues"
          routerLinkActive="text-white"
          #rlaLeagues="routerLinkActive"
          class="group relative text-base md:text-lg font-display font-semibold tracking-wide text-white/80 hover:text-white transition">
          <span>Ligas</span>
          <span
            class="absolute left-0 -bottom-1 h-[2px] bg-gradient-to-r from-[#ff2e74] to-[#7d0c87] transition-all duration-300 block"
            [class.w-full]="rlaLeagues.isActive" [class.w-0]="!rlaLeagues.isActive"></span>
        </a>
      </div>

      <!-- Lado derecho -->
      <div class="relative" *ngIf="isLoggedIn(); else guest">
        <button (click)="open.set(!open())" class="flex items-center gap-2">
          <img [src]="avatar() || '/assets/profile-placeholder.png'" alt=""
               class="w-9 h-9 rounded-full object-cover border border-white/10">
          <span class="hidden md:block text-white/80">{{ auth.user()?.name || 'Yo' }}</span>
        </button>

        <div *ngIf="open()" class="absolute right-0 mt-2 w-56 rounded-xl border border-white/10 bg-[#0b0b0f] shadow-2xl overflow-hidden">
          <div class="px-3 py-2 text-[11px] text-white/40">Mi cuenta</div>
          <a routerLink="/my-team" class="block px-3 py-2 text-sm text-white/80 hover:bg-white/5">Mi equipo</a>
          <a routerLink="/profile" class="block px-3 py-2 text-sm text-white/80 hover:bg-white/5">Perfil</a>
          <div class="h-px bg-white/10 my-1"></div>
          <button (click)="logout()" class="w-full text-left px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10">
            Cerrar sesión
          </button>
        </div>
      </div>

      <ng-template #guest>
        <div class="flex items-center gap-2">
          <a [routerLink]="loginLink"
             (click)="navFallback($event, loginLink, altLoginLink)"
             class="text-white/80 hover:text-white text-sm px-3 py-1.5 rounded-lg border border-white/10 bg-white/5">
            Entrar
          </a>
          <a [routerLink]="registerLink"
             (click)="navFallback($event, registerLink, altRegisterLink)"
             class="rounded-lg px-3 py-1.5 text-sm bg-gradient-to-r from-[#7d0c87] to-[#ff2e74] text-white shadow">
            Crear cuenta
          </a>
        </div>
      </ng-template>
    </div>
  </nav>

  <!-- Contenido con márgenes globales -->
  <main class="mx-auto max-w-7xl px-4 md:px-6 py-4">
    <router-outlet></router-outlet>
  </main>
</div>
  `
})
export class AppComponent {
  private router = inject(Router);
  auth = inject(AuthService);

  open = signal(false);

  // 🔁 Computed reactivas (solucionan el nav que no se actualizaba)
  isLoggedIn = computed(() => !!this.auth.user());
  avatar = signal<string | null>(null);

  // Escucha cambios del usuario y refresca avatar automáticamente
  _syncAvatar = effect(() => {
    const u: any = this.auth.user();
    this.avatar.set(u?.photoUrl ?? null);
  });

  // Enlaces (y fallback por si tus rutas son /login y /register)
  loginLink = '/auth/login';
  registerLink = '/auth/register';
  altLoginLink = '/login';
  altRegisterLink = '/register';

  async logout() {
    try {
      await this.auth.logout().toPromise();
      this.open.set(false);
      // Opcional: fuerza navegación para ver el estado invitado inmediatamente
      // this.router.navigateByUrl('/');
    } catch {}
  }

  navFallback(ev: Event, primary: string, alt: string) {
    // Si por alguna razón el routerLink no navega (dev raro),
    // intentamos la alternativa tras un tick.
    setTimeout(() => {
      const url = this.router.url;
      if (url === this.router.url) {
        this.router.navigateByUrl(alt);
      }
    });
  }
}
