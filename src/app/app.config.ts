import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';


@Component({
selector: 'app-root',
standalone: true,
imports: [RouterOutlet, RouterLink],
template: `
<header class="sticky top-0 z-50 backdrop-blur bg-[#0b0f1480] border-b border-white/5">
<div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
<a routerLink="/" class="text-xl font-bold">Fantasy LoL</a>
<nav class="flex gap-4 text-sm">
<a routerLink="/players" class="hover:underline">Jugadores</a>
<a routerLink="/teams" class="hover:underline">Equipos</a>
<a routerLink="/schedule" class="hover:underline">Calendario</a>
<a routerLink="/draft" class="hover:underline">Draft</a>
</nav>
</div>
</header>
<main class="max-w-7xl mx-auto px-4 py-6">
<router-outlet />
</main>
`
})
export class AppComponent {}