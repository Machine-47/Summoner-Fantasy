import { Component, inject } from '@angular/core';
import { NgFor } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LeaguesService, League } from './leagues.service';

@Component({
  standalone: true,
  selector: 'app-leagues-page',
  imports: [NgFor, RouterLink],
  template: `
<section class="px-4 md:px-8 py-8 space-y-8">
  <header class="space-y-2">
    <h1 class="text-3xl md:text-4xl font-black tracking-tight text-white">Ligas</h1>
    <p class="text-white/60">Elige una liga para jugar en modo Draft o Pick’em.</p>
  </header>

  <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
    <article *ngFor="let l of leagues"
             class="rounded-3xl border border-white/10 bg-gradient-to-br from-[#1b0b1f] to-[#0e0e0e] p-5 hover:shadow-xl hover:shadow-black/40 transition">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-2xl bg-white/10 grid place-items-center text-white/70 font-bold">
          {{ l.badge[0] || 'L' }}
        </div>
        <div class="text-xs font-semibold text-white/70 uppercase tracking-wide">{{ l.badge }}</div>
      </div>

      <h3 class="mt-3 text-xl font-bold text-white">{{ l.title }}</h3>
      <p class="text-white/60">{{ l.subtitle }}</p>

      <div class="mt-4">
        <span class="inline-flex items-center rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-white/70">
          {{ l.mode === 'pickem' ? 'Modo Pick’em' : 'Modo Draft' }}
        </span>
      </div>

      <div class="mt-5">
        <a [routerLink]="['/leagues', l.slug]"
           class="inline-flex items-center justify-center rounded-xl px-4 py-2 bg-[#7d0c87] hover:bg-[#8d1398] text-white font-semibold">
          Jugar
        </a>
      </div>
    </article>
  </div>
</section>
`
})
export class LeaguesPage {
  private svc = inject(LeaguesService);
  leagues: League[] = this.svc.getLolLeagues();
}
