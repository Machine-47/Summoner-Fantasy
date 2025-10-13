// src/app/features/leagues/league-detail.page.ts
import { Component, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LeaguesService, League } from './leagues.service';

@Component({
  standalone: true,
  selector: 'app-league-detail',
  imports: [NgIf, RouterLink],
  template: `
    <section class="space-y-6 animate-fade-up">
      <a routerLink="/leagues" class="text-sm text-white/70 hover:text-white">← Volver a Ligas</a>

      <div *ngIf="league; else notFound" class="space-y-4">
        <h1 class="page-title text-[2.1rem] sm:text-[2.5rem] tracking-[.08em]">
          {{ league.title }}
        </h1>

        <div class="card p-5">
          <p class="text-white/80 text-sm">
            {{ league.subtitle }}
          </p>

          <div class="mt-4 flex items-center gap-3">
            <span class="chip bebas uppercase tracking-[.1em]">{{ league.badge }}</span>
            <span class="chip uppercase text-xs">{{ league.mode === 'pickem' ? 'Modo Pick’em' : 'Modo Draft' }}</span>
          </div>

          <div class="mt-6">
            <button class="btn btn-brand">Comenzar</button>
          </div>
        </div>
      </div>

      <ng-template #notFound>
        <div class="text-white/70">Liga no encontrada.</div>
      </ng-template>
    </section>
  `
})
export class LeagueDetailPage {
  private route = inject(ActivatedRoute);
  private svc   = inject(LeaguesService);

  league?: League;

  constructor() {
    const slug = this.route.snapshot.paramMap.get('slug') ?? '';
    this.league = this.svc.getBySlug(slug);
  }
}
