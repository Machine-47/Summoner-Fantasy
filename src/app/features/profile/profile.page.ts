import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
  standalone: true,
  imports: [FormsModule, NgIf],
  template: `
    <section class="max-w-2xl mx-auto space-y-6">
      <h2 class="text-2xl font-bold">Tu perfil</h2>

      <div class="card space-y-4" *ngIf="loaded">
        <div class="flex items-center gap-4">
          <img [src]="avatarUrl || 'https://placehold.co/96x96?text=🙂'"
               class="w-16 h-16 rounded-full object-cover ring-2 ring-white/10" />
          <div>
            <div class="text-sm text-gray-400">{{ email }}</div>
            <div class="font-semibold text-lg">{{ displayName || '(sin nombre)' }}</div>
          </div>
        </div>

        <form (ngSubmit)="save()" class="space-y-3">
          <div>
            <label class="text-sm text-gray-400">Nombre a mostrar</label>
            <input class="input" [(ngModel)]="displayName" name="displayName" placeholder="Tu nombre en la app" />
          </div>
          <div>
            <label class="text-sm text-gray-400">Avatar (URL)</label>
            <input class="input" [(ngModel)]="avatarUrl" name="avatarUrl" placeholder="https://..." />
          </div>
          <button class="btn btn-primary">Guardar cambios</button>
        </form>
      </div>
    </section>
  `
})
export class ProfilePage implements OnInit {
  private auth = inject(AuthService);

  loaded = false;
  email = '';
  displayName = '';
  avatarUrl = '';

  ngOnInit() {
    this.auth.getProfile().subscribe({
      next: (p) => {
        this.email = p.email;
        this.displayName = p.displayName ?? '';
        this.avatarUrl = p.avatarUrl ?? '';
        // actualiza el header si cambias nombre
        this.auth.user.set({ id: p.id, name: p.displayName ?? p.email });
        this.loaded = true;
      },
      error: () => { this.loaded = true; }
    });
  }

  save() {
    this.auth.updateProfile({ displayName: this.displayName, avatarUrl: this.avatarUrl })
      .subscribe({
        next: (p) => {
          this.auth.user.set({ id: p.id, name: p.displayName ?? p.email });
          alert('Perfil actualizado');
        }
      });
  }
}
