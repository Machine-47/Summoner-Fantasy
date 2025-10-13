import { Component } from '@angular/core';


@Component({
standalone: true,
selector: 'app-draft-page',
template: `
  <section class="space-y-6">
    <h2 class="text-2xl font-bold">Draft (tu plantilla)</h2>
    <div class="card text-center py-10">
      <p class="text-gray-400">Aquí implementaremos slots <b>TOP/JG/MID/ADC/SUPP</b>, presupuesto y reglas de puntuación.</p>
      <div class="mt-4">
        <a routerLink="/players" class="btn btn-primary">Empezar eligiendo jugadores</a>
      </div>
    </div>
  </section>
`

})
export class DraftPage {}