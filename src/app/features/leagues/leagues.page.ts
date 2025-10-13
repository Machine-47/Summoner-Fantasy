// src/app/features/leagues/leagues.page.ts
import { Component, inject } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LeaguesService, League } from './leagues.service';



@Component({
  standalone: true,
  selector: 'app-leagues-page',
  imports: [NgFor, NgIf, RouterLink],
  template: `
    <section class="space-y-6 animate-fade-up">
      <!-- Cabecera -->
      <div class="flex items-center justify-between">
        <h1 class="page-title text-[2.2rem] sm:text-[2.6rem] tracking-[.08em]">
          Ligas
        </h1>

        <a routerLink="/my-team" class="btn btn-minimal">
          <!-- escudo minimal -->
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l7 3v6c0 5-3.4 9.7-7 11-3.6-1.3-7-6-7-11V5l7-3z"/>
          </svg>
          <span class="hidden sm:inline">Mi equipo</span>
        </a>
      </div>

      <!-- Bloque regreso / info -->
      <div class="card p-4 flex items-center gap-3">
        <div class="h-9 w-9 rounded-full grid place-items-center bg-white/10 border border-white/10">
          <!-- icon balón/estrella -->
          <svg class="w-5 h-5 text-white/90" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l2.39 4.84L20 8l-4 3.9L17.18 18 12 15.45 6.82 18 8 11.9 4 8l5.61-1.16L12 2z"/>
          </svg>
        </div>
        <div>
          <div class="text-sm text-white/80">Estamos de vuelta</div>
          <div class="text-xs text-white/60">Crea o únete a ligas, compite con tus amigos y haz tus selecciones.</div>
        </div>
      </div>

        

      <!-- Sección: League of Legends -->
      <div class="space-y-2">
        
        <h2 class="h2 bebas text-brand-purple tracking-[.1em]">League of Legends</h2>

        <div class="grid gap-3">
          <ng-container *ngFor="let l of leaguesLol">
            <article class="card overflow-hidden">
              <div class="p-4 sm:p-5 flex items-center gap-4">
                <!-- Icono -->
                <div class="shrink-0 h-12 w-12 rounded-2xl bg-white/10 border border-white/10 grid place-items-center">
                  <img *ngIf="l.icon" [src]="l.icon" class="h-6 w-6 opacity-90" alt="" />
                  <svg *ngIf="!l.icon" class="h-6 w-6 text-white/80" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l7 3v6c0 5-3.4 9.7-7 11-3.6-1.3-7-6-7-11V5l7-3z"/>
                  </svg>
                </div>

                <!-- Texto -->
                <div class="min-w-0 grow">
                  <div class="text-xs text-brand-purple/80 bebas tracking-[.14em] uppercase">
                    {{ l.badge }}
                  </div>
                  <h3 class="player-name text-white text-[1.35rem] sm:text-[1.45rem] truncate">
                    {{ l.title }}
                  </h3>
                  <div class="text-xs text-white/60">
                    {{ l.subtitle }}
                  </div>
                </div>

                <!-- CTA -->
                <a [routerLink]="['/leagues', l.slug]" class="btn btn-minimal px-4 py-2">
                  Jugar
                </a>
              </div>
            </article>
          </ng-container>
        </div>
      </div>
    </section>
  `
})
export class LeaguesPage {
  private svc = inject(LeaguesService);

  leaguesLol: League[] = this.svc.getLolLeagues();
}
