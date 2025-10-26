import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-mobile-nav',
  imports: [RouterLink, RouterLinkActive],
  template: `
<nav
  class="fixed bottom-0 left-0 right-0 z-40 md:hidden
         bg-black/70 backdrop-blur border-t border-white/10">
  <ul class="grid grid-cols-5">
    <li>
      <a routerLink="/players" routerLinkActive="active" class="mobile-tab">
        <svg viewBox="0 0 24 24" class="icon"><path fill="currentColor"
         d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2C8.67 14 4 15.34 4 18v2h16v-2c0-2.66-4.67-4-8-4Z"/></svg>
        <span>Jug</span>
      </a>
    </li>
    <li>
      <a routerLink="/teams" routerLinkActive="active" class="mobile-tab">
        <svg viewBox="0 0 24 24" class="icon"><path fill="currentColor"
         d="M4 7h16v10H4zM2 5h20v2H2zm0 12h20v2H2z"/></svg>
        <span>Equip</span>
      </a>
    </li>
    <li>
      <a routerLink="/calendar" routerLinkActive="active" class="mobile-tab">
        <svg viewBox="0 0 24 24" class="icon"><path fill="currentColor"
         d="M7 2h2v2h6V2h2v2h3a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3Zm13 6H4v10h16ZM6 11h5v5H6z"/></svg>
        <span>Cal</span>
      </a>
    </li>
    <li>
      <a routerLink="/leagues" routerLinkActive="active" class="mobile-tab">
        <svg viewBox="0 0 24 24" class="icon"><path fill="currentColor"
         d="M12 2l2.39 4.84L20 8l-4 3.89L17 18l-5-2.62L7 18l1-6.11L4 8l5.61-1.16L12 2z"/></svg>
        <span>Ligas</span>
      </a>
    </li>
    <li>
      <a routerLink="/profile" routerLinkActive="active" class="mobile-tab">
        <svg viewBox="0 0 24 24" class="icon"><path fill="currentColor"
         d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4 0-8 2-8 5v1h16v-1c0-3-4-5-8-5z"/></svg>
        <span>Yo</span>
      </a>
    </li>
  </ul>
</nav>
  `,
  styles: [`
    .mobile-tab {
      @apply flex flex-col items-center justify-center py-2 text-[11px]
             text-white/70 hover:text-white transition;
    }
    .mobile-tab .icon { @apply h-6 w-6 mb-0.5; }
    .mobile-tab.active { @apply text-white; }
    .mobile-tab.active .icon { @apply text-accent2; }
  `]
})
export class MobileNavComponent {}
