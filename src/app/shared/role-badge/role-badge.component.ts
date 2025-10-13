import { Component, Input, signal, computed } from '@angular/core';
import { NgClass } from '@angular/common';

type Role = 'TOP' | 'JUNGLE' | 'MID' | 'ADC' | 'SUPPORT';

@Component({
  standalone: true,
  selector: 'app-role-badge',
  imports: [NgClass],
  styles: [`
    .chip {
      @apply inline-flex items-center rounded-lg px-2 py-0.5 text-xs border font-medium;
    }
  `],
  template: `
    <span class="chip"
      [ngClass]="{
        'bg-orange-500/15 text-orange-300 border-orange-500/20': currentRole() === 'TOP',
        'bg-green-500/15 text-green-300 border-green-500/20': currentRole() === 'JUNGLE',
        'bg-blue-500/15 text-blue-300 border-blue-500/20': currentRole() === 'MID',
        'bg-pink-500/15 text-pink-300 border-pink-500/20': currentRole() === 'ADC',
        'bg-violet-500/15 text-violet-300 border-violet-500/20': currentRole() === 'SUPPORT'
      }">
      {{ currentRole() }}
    </span>
  `
})
export class RoleBadgeComponent {
  private _role = signal<Role>('MID');

  @Input() set role(value: string | undefined) {
    const up = (value || '').toUpperCase();
    const valid = ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'];
    this._role.set((valid.includes(up) ? up : 'MID') as Role);
  }

  currentRole = computed(() => this._role());
}
