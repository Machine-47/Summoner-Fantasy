import { Component, OnInit, inject } from '@angular/core';
import { NgFor, DatePipe } from '@angular/common';
import { MockDataService } from '../../core/services/mock-data.service';


@Component({
standalone: true,
selector: 'app-schedule-page',
imports: [NgFor, DatePipe],
template: `
  <section class="space-y-6">
    <h2 class="text-2xl font-bold">Calendario (Worlds)</h2>
    <div class="space-y-3">
      <div *ngFor="let m of matches" class="card flex flex-wrap items-center justify-between gap-3">
        <div class="badge">{{ m.tournament }} • {{ m.format }}</div>
        <div class="font-semibold">
          {{ m.blue.name }} <span class="text-gray-500">vs</span> {{ m.red.name }}
        </div>
        <div class="text-sm text-gray-300">{{ m.startTime | date:'medium' }}</div>
      </div>
    </div>
  </section>
`

})
export class SchedulePage implements OnInit {
private api = inject(MockDataService);
matches: any[] = [];
ngOnInit(){ this.api.getSchedule().subscribe(m => this.matches = m as any[]); }
}