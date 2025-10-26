import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from './core/services/auth.service';
import { MobileNavComponent } from './shared/mobile-nav/mobile-nav.component';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, NgIf, MobileNavComponent],
  template: `
<header class="sticky top-0 z-40 backdrop-blur bg-black/60 border-b border-white/10">
  <div class="page-wrap flex h-14 items-center justify-between">
    <!-- Brand -->
    <a routerLink="/" class="flex items-center gap-2">
      <img src="/assets/rift.png" alt="" class="h-7 w-7" />
      <span class="font-display text-xl md:text-2xl font-extrabold tracking-tight">
        <span class="bg-gradient-to-r from-[#ff2e74] to-[#7d0c87] bg-clip-text text-transparent">Summoner</span>
        <span class="text-white/90">Fantasy</span>
      </span>
    </a>

    <!-- Desktop nav -->
    <nav class="hidden md:flex items-center gap-6">
      <a routerLink="/players" routerLinkActive="after:w-full after:left-0 text-white"
         class="relative text-[15px] md:text-[16px] font-semibold text-white/70 hover:text-white transition
                after:absolute after:-bottom-2 after:left-1/2 after:h-[2px] after:w-0 after:-translate-x-1/2
                after:bg-gradient-to-r after:from-[#7d0c87] after:to-[#ff2e74] after:transition-all after:duration-300 hover:after:w-full">
        Jugadores
      </a>
      <a routerLink="/teams" routerLinkActive="after:w-full after:left-0 text-white"
         class="relative text-[15px] md:text-[16px] font-semibold text-white/70 hover:text-white transition
                after:absolute after:-bottom-2 after:left-1/2 after:h-[2px] after:w-0 after:-translate-x-1/2
                after:bg-gradient-to-r after:from-[#7d0c87] after:to-[#ff2e74] after:transition-all after:duration-300 hover:after:w-full">
        Equipos
      </a>
      <a routerLink="/leagues" routerLinkActive="after:w-full after:left-0 text-white"
         class="relative text-[15px] md:text-[16px] font-semibold text-white/70 hover:text-white transition
                after:absolute after:-bottom-2 after:left-1/2 after:h-[2px] after:w-0 after:-translate-x-1/2
                after:bg-gradient-to-r after:from-[#7d0c87] after:to-[#ff2e74] after:transition-all after:duration-300 hover:after:w-full">
        Ligas
      </a>
    </nav>

    <!-- Right: auth -->
    <div class="hidden md:flex items-center gap-2" *ngIf="!auth.user(); else logged">
      <!-- Enlaces con fallback por si tus rutas son /login /register -->
      <a [routerLink]="loginLink" class="btn-ghost" (click)="navFallback($event, loginLink, altLoginLink)">Entrar</a>
      <a [routerLink]="registerLink" class="btn-primary" (click)="navFallback($event, registerLink, altRegisterLink)">Crear cuenta</a>
    </div>
    <ng-template #logged>
      <div class="hidden md:flex items-center gap-3">
        <a routerLink="/my-team" class="btn-ghost">Mi equipo</a>
        <div class="relative">
          <button (click)="open.set(!open())" class="flex items-center gap-2">
            <img [src]="avatar() || '/assets/profile-placeholder.png'" alt=""
                 class="h-8 w-8 rounded-full border border-white/10 object-cover"/>
            <span class="hidden lg:block text-sm text-white/80">{{ auth.user()?.name || 'Yo' }}</span>
          </button>
          <div *ngIf="open()" (click)="$event.stopPropagation()"
               class="absolute right-0 mt-2 w-48 rounded-xl border border-white/10 bg-black/90 shadow-soft p-2">
            <a routerLink="/profile" class="block rounded-lg px-3 py-2 hover:bg-white/10">Perfil</a>
            <button (click)="logout()" class="block w-full text-left rounded-lg px-3 py-2 hover:bg-white/10">
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </ng-template>

    <!-- Mobile toggle -->
    <button class="md:hidden rounded-lg border border-white/10 bg-white/5 p-2" (click)="mobile.set(true)">
      <svg class="h-5 w-5 text-white/90" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"/>
      </svg>
    </button>
  </div>

  <!-- Mobile drawer -->
  <div class="md:hidden" *ngIf="mobile()">
    <div class="page-wrap py-3 flex flex-col gap-2">
      <a routerLink="/players" class="btn-ghost" (click)="mobile.set(false)">Jugadores</a>
      <a routerLink="/teams" class="btn-ghost" (click)="mobile.set(false)">Equipos</a>
      <a routerLink="/leagues" class="btn-ghost" (click)="mobile.set(false)">Ligas</a>

      <ng-container *ngIf="!auth.user(); else mobileLogged">
        <a [routerLink]="loginLink" class="btn-ghost" (click)="mobile.set(false); navFallback($event, loginLink, altLoginLink)">Entrar</a>
        <a [routerLink]="registerLink" class="btn-primary" (click)="mobile.set(false); navFallback($event, registerLink, altRegisterLink)">Crear cuenta</a>
      </ng-container>
      <ng-template #mobileLogged>
        <a routerLink="/my-team" class="btn-ghost" (click)="mobile.set(false)">Mi equipo</a>
        <a routerLink="/profile" class="btn-ghost" (click)="mobile.set(false)">Perfil</a>
        <button class="btn-primary" (click)="logout(); mobile.set(false)">Cerrar sesión</button>
      </ng-template>
    </div>
  </div>
</header>

<main class="page-wrap py-6">
  <router-outlet/>
  <app-mobile-nav></app-mobile-nav>
</main>
  `
})
export class AppComponent {
  private router = inject(Router);
  auth = inject(AuthService);
  open = signal(false);
  mobile = signal(false);

  // computed/efectos para mantener avatar si lo usas en el futuro
  avatar = signal<string | null>(null);
  _syncAvatar = effect(() => {
    const u: any = this.auth.user();
    this.avatar.set(u?.photoUrl ?? null);
  });

  // Fallbacks por si tus rutas son /login /register en lugar de /auth/*
  loginLink = '/auth/login';
  registerLink = '/auth/register';
  altLoginLink = '/login';
  altRegisterLink = '/register';

  async logout() {
    try {
      await this.auth.logout().toPromise();
      this.open.set(false);
    } catch {}
  }

  navFallback(ev: Event, primary: string, alt: string) {
    // Si por algún motivo la ruta no existe, intenta la alternativa al siguiente tick
    setTimeout(() => {
      const want = primary;
      const now = this.router.url;
      // Si no navegó (sigue en el mismo sitio), prueba alt
      if (now === this.router.url) {
        this.router.navigateByUrl(alt);
      }
    });
  }
}
