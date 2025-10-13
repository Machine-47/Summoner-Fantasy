import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';


@Component({
    standalone: true,
    selector: 'app-home',
    imports: [RouterLink],
    template: `
  <section class="grid gap-6 lg:grid-cols-3 animate-fade-up">
  <div class="lg:col-span-2">
    <h1 class="h1">Crea tu plantilla y domina los Worlds</h1>
    <p class="subtle mt-2">Compra jugadores, gestiona tu presupuesto y compite con tus amigos.</p>

    <div class="flex gap-2 mt-4">
      <a routerLink="/players" class="btn btn-primary">Explorar jugadores</a>
      <a routerLink="/draft" class="btn btn-secondary">Ir al Draft</a>
    </div>
  </div>

  <div class="card p-5">
    <div class="text-sm text-ink-300 mb-2">Presupuesto inicial</div>
    <div class="text-4xl font-bold text-acc-primary">15</div>
    <div class="subtle mt-2">Oro para empezar tu equipo</div>
  </div>
</section>
`

})
export class HomeComponent {}
