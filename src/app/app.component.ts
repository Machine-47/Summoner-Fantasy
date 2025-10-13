import { Component, OnInit, inject, HostListener } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIf],
  template: `
    <!-- NAV -->
    <header class="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur">
      <div class="container h-16 sm:h-[68px] flex items-center justify-between px-4">
        <!-- Logo -->
        <a routerLink="/" class="flex items-center gap-2 group">
          <span class="font-display text-white text-2xl sm:text-3xl tracking-[0.1em] uppercase">
            Summoner <span class="text-brand-purple">Fantasy</span>
          </span>
          <span class="hidden sm:inline-block h-2 w-2 rounded-full bg-gradient-to-r from-brand-red to-brand-purple
                        shadow-[0_0_18px_rgba(135,10,149,0.7)] group-hover:scale-110 transition"></span>
        </a>

        <!-- Desktop nav -->
        <nav class="hidden md:flex items-center gap-6 text-sm">
          <a routerLink="/players" routerLinkActive="link-active" class="nav-link">Jugadores</a>
          <a routerLink="/teams" routerLinkActive="link-active" class="nav-link">Equipos</a>
          <a routerLink="/schedule" routerLinkActive="link-active" class="nav-link">Calendario</a>
          <a routerLink="/leagues" routerLinkActive="link-active" class="nav-link">Ligas</a>

          <!-- Botón minimal “Mi equipo” solo si logueado -->
          <a *ngIf="auth.user()" routerLink="/my-team" routerLinkActive="link-active"
             class="btn btn-minimal ml-2">
            <!-- icono escudo -->
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2l7 3v6c0 5-3.4 9.7-7 11-3.6-1.3-7-6-7-11V5l7-3z"/>
            </svg>
            <span class="hidden lg:inline">Mi equipo</span>
          </a>

          <span class="mx-2 text-white/15">|</span>

          <!-- No logueado -->
          <ng-container *ngIf="!auth.user(); else loggedMenu">
            <a routerLink="/login" class="nav-link">Entrar</a>
            <a routerLink="/register" class="btn btn-brand">Registrarse</a>
          </ng-container>

          <!-- Logueado -->
          <ng-template #loggedMenu>
            <div class="relative" (click)="$event.stopPropagation()">
              <button (click)="toggleMenu()" aria-label="Abrir menú de usuario"
                      class="flex items-center gap-2 px-2 py-1.5 rounded-xl
                             bg-white/5 border border-white/10 hover:bg-white/10 transition">
                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-brand-red to-brand-purple
                            text-white grid place-items-center font-semibold">
                  {{ initial() }}
                </div>
                <span class="hidden sm:inline text-sm text-white/90 max-w-[10rem] truncate">
                  {{ auth.user()?.name }}
                </span>
                <svg class="w-4 h-4 text-white/70" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z"
                    clip-rule="evenodd" />
                </svg>
              </button>

              <!-- Dropdown -->
              <div *ngIf="menuOpen"
                   class="absolute right-0 mt-2 w-56 bg-black/80 backdrop-blur-xl
                          border border-white/10 rounded-xl shadow-xl p-2">
                <a routerLink="/profile" class="dropdown-item">Mi perfil</a>
                <a routerLink="/my-team" class="dropdown-item">Mi equipo</a>
                <hr class="my-1 border-white/10">
                <button (click)="logout()" class="dropdown-item text-red-300 hover:text-red-200">
                  Cerrar sesión
                </button>
              </div>
            </div>
          </ng-template>
        </nav>

        <!-- Mobile: avatar o CTA + hamburguesa -->
        <div class="md:hidden flex items-center gap-2">
          <ng-container *ngIf="auth.user(); else mobileCtas">
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-brand-red to-brand-purple
                        text-white grid place-items-center font-semibold">
              {{ initial() }}
            </div>
          </ng-container>
          <ng-template #mobileCtas>
            <a routerLink="/login" class="nav-link">Entrar</a>
          </ng-template>

          <button class="ml-1 p-2 rounded-lg bg-white/5 border border-white/10"
                  (click)="mobileOpen = !mobileOpen"
                  aria-label="Abrir menú">
            <svg *ngIf="!mobileOpen; else closeIcon" class="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
            <ng-template #closeIcon>
              <svg class="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </ng-template>
          </button>
        </div>
      </div>

      <!-- Menú móvil -->
      <div *ngIf="mobileOpen" class="md:hidden bg-black/70 backdrop-blur-md border-b border-white/10">
        <div class="container px-4 py-3 flex flex-col gap-2">
          <a routerLink="/players" routerLinkActive="link-active" class="nav-link py-2">Jugadores</a>
          <a routerLink="/teams" routerLinkActive="link-active" class="nav-link py-2">Equipos</a>
          <a routerLink="/schedule" routerLinkActive="link-active" class="nav-link py-2">Calendario</a>
          <a routerLink="/leagues" routerLinkActive="link-active" class="nav-link py-2">Ligas</a>

          <a *ngIf="auth.user()" routerLink="/my-team"
             class="btn btn-minimal w-full mt-2">
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2l7 3v6c0 5-3.4 9.7-7 11-3.6-1.3-7-6-7-11V5l7-3z"/>
            </svg>
            <span>Mi equipo</span>
          </a>

          <ng-container *ngIf="!auth.user()">
            <a routerLink="/register" class="btn btn-brand w-full">Registrarse</a>
          </ng-container>
        </div>
      </div>
    </header>

    <!-- CONTENIDO -->
    <main class="container py-8">
      <router-outlet />
    </main>
  `,
  styles: [`
    .nav-link { @apply text-white/80 tracking-wider uppercase; }
    .nav-link:hover { @apply text-white; }
    .link-active { @apply text-white relative; }
    .link-active::after {
      content: '';
      @apply absolute left-0 -bottom-2 h-0.5 w-full rounded-full;
      background: linear-gradient(90deg, #f2203b, #870a95);
      box-shadow: 0 0 12px rgba(135,10,149,.45);
    }
    .btn {
      @apply inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2
             text-sm font-medium transition border border-white/10 select-none;
    }
    /* Botón minimal: sin gradiente, glass suave y borde hairline */
    .btn-minimal {
      @apply text-white/90 bg-white/5 hover:bg-white/10 border border-white/10;
    }
    .btn-brand {
      @apply text-white shadow-glow tracking-wider uppercase;
      background: linear-gradient(90deg, #f2203b 0%, #870a95 100%);
    }
    .btn-brand:hover { filter: brightness(1.08); transform: translateY(-1px); }
    .shadow-glow {
      box-shadow: 0 0 0 1px rgba(135,10,149,.24), 0 10px 28px rgba(135,10,149,.22);
    }
    .dropdown-item {
      @apply w-full text-left px-3 py-2 rounded-lg text-sm text-white/90
             hover:bg-white/10 transition;
    }
  `]
})
export class AppComponent implements OnInit {
  auth = inject(AuthService);
  private router = inject(Router);

  menuOpen = false;
  mobileOpen = false;

  ngOnInit() {
    this.auth.me().subscribe({
      next: (res: any) => this.auth.user.set({ id: res.id, name: res.name }),
      error: () => {}
    });
  }

  initial() {
    const n = this.auth.user()?.name ?? '';
    return n.trim() ? n.trim()[0].toUpperCase() : 'U';
  }

  toggleMenu() { this.menuOpen = !this.menuOpen; }

  @HostListener('document:click') closeOnOutsideClick() {
    this.menuOpen = false;
  }

  logout() {
    this.auth.logout().subscribe(() => {
      this.auth.user.set(null);
      this.menuOpen = false;
      this.router.navigateByUrl('/');
    });
  }
}
