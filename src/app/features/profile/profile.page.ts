import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

/** Si tienes ApiService con uploadAvatar$, el componente lo usará automáticamente */
import { ApiService } from '../../core/services/api.service';

@Component({
  standalone: true,
  selector: 'app-profile-page',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NgIf],
  template: `
<section class="space-y-6">
  <!-- Cabecera -->
  <header class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl md:text-4xl font-extrabold font-display tracking-tight">Perfil</h1>
      <p class="text-white/60 text-sm mt-1">Configura tu cuenta, tu nombre público y tu avatar.</p>
    </div>
    <a routerLink="/my-team"
       class="hidden md:inline-block rounded-lg px-3 py-1.5 text-sm bg-white/5 border border-white/10 hover:bg-white/10">
      Mi equipo
    </a>
  </header>

  <!-- Card principal -->
  <div class="rounded-2xl border border-white/10 bg-[#0c0c12]">
    <div class="p-5 md:p-6 flex flex-col md:flex-row gap-6 md:gap-10">
      <!-- Avatar -->
      <div class="flex flex-col items-center gap-3 md:w-64">
        <div class="relative">
          <img
            [src]="preview() || form.value.avatarUrl || '/assets/profile-placeholder.png'"
            class="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border border-white/10 shadow"
            alt="Avatar">
          <div *ngIf="saving()" class="absolute inset-0 rounded-full bg-black/40 grid place-items-center text-xs">Guardando…</div>
        </div>

        <div class="flex flex-col items-center gap-2">
          <!-- Botón subir imagen (si hay API de subida) -->
          <ng-container *ngIf="canUploadAvatar; else urlInput">
            <label class="cursor-pointer text-[13px] rounded-lg px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10">
              <input type="file" accept="image/*" class="hidden" (change)="onPick($event)">
              Cambiar imagen
            </label>
            <button *ngIf="preview()" (click)="clearPreview()"
                    class="text-xs text-white/60 hover:text-white">Quitar preview</button>
          </ng-container>

          <!-- Fallback: pegar URL si no hay endpoint de subida -->
          <ng-template #urlInput>
            <input type="url" placeholder="URL del avatar"
                   class="w-56 bg-black/30 border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7d0c87]"
                   [formControl]="form.controls.avatarUrl">
          </ng-template>
        </div>
      </div>

      <!-- Formulario -->
      <form class="flex-1 grid gap-4" [formGroup]="form" (ngSubmit)="save()">
        <!-- Email (solo lectura) -->
        <div>
          <label class="block text-[11px] uppercase tracking-wide text-white/50 mb-1">Email</label>
          <input type="email" class="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-white/70"
                 [value]="email" disabled>
        </div>

        <!-- Display Name -->
        <div>
          <label class="block text-[11px] uppercase tracking-wide text-white/50 mb-1">Nombre público</label>
          <input type="text" formControlName="displayName"
                 class="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7d0c87]"
                 placeholder="Cómo te verán los demás">
          <div class="text-xs text-rose-400 mt-1" *ngIf="form.controls.displayName.touched && form.controls.displayName.invalid">
            Debe tener al menos 2 caracteres.
          </div>
        </div>

        <!-- Avatar URL (solo visible si también se muestra por si quieres editar la URL manualmente) -->
        <div *ngIf="!canUploadAvatar">
          <label class="block text-[11px] uppercase tracking-wide text-white/50 mb-1">Avatar (URL)</label>
          <input type="url" formControlName="avatarUrl"
                 class="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7d0c87]"
                 placeholder="https://…/avatar.png">
        </div>

        <!-- Botones -->
        <div class="flex items-center gap-3 pt-2">
          <button type="submit" [disabled]="saving() || form.invalid"
                  class="rounded-lg px-4 py-2 text-sm bg-gradient-to-r from-[#7d0c87] to-[#ff2e74] text-white disabled:opacity-60">
            Guardar cambios
          </button>
          <button type="button" (click)="reset()"
                  class="rounded-lg px-4 py-2 text-sm bg-white/5 border border-white/10 hover:bg-white/10">
            Deshacer
          </button>
          <div class="text-white/60 text-xs" *ngIf="error()">{{ error() }}</div>
        </div>
      </form>
    </div>
  </div>

  <!-- Card secundaria simple: guía -->
  <div class="rounded-2xl border border-white/10 bg-[#0c0c12]">
    <div class="p-5 md:p-6">
      <h3 class="font-semibold text-white/90 mb-2">Consejos</h3>
      <ul class="list-disc list-inside text-sm text-white/60 space-y-1">
        <li>El nombre público se usa en ligas y clasificaciones.</li>
        <li>La imagen de avatar debe ser cuadrada para verse perfecta.</li>
      </ul>
    </div>
  </div>
</section>
  `
})
export class ProfilePage implements OnInit {
  private fb = inject(FormBuilder);
  auth = inject(AuthService);
  api = inject(ApiService); // si no existe uploadAvatar$, simplemente no se usa

  // Estado UI
  loading = signal(true);
  saving  = signal(false);
  error   = signal<string | null>(null);
  preview = signal<string | null>(null);

  // Detecta si existe método de subida
  canUploadAvatar = !!(this.api as any).uploadAvatar$;

  // Email solo informativo
  email = '';

  form = this.fb.group({
    displayName: this.fb.control('', [Validators.minLength(2)]),
    avatarUrl:   this.fb.control<string | null>(null)
  });

  ngOnInit(): void {
    // Carga inicial del perfil
    this.auth.getProfile().subscribe({
      next: (p) => {
        this.email = p.email ?? '';
        this.form.patchValue({
          displayName: p.displayName ?? '',
          avatarUrl: p.avatarUrl ?? ''
        });

        // sincroniza el header/nav con el estado inicial
        this.auth.user.set({
          id: p.id,
          name: p.displayName ?? p.email ?? '',
          avatarUrl: p.avatarUrl ?? undefined
        });

        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el perfil.');
        this.loading.set(false);
      }
    });
  }

  /** Subida opcional de avatar (si hay endpoint) */
  async onPick(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // preview local
    const reader = new FileReader();
    reader.onload = () => this.preview.set(String(reader.result));
    reader.readAsDataURL(file);

    if (!this.canUploadAvatar) return;

    try {
      this.saving.set(true);
      // @ts-ignore - método opcional
      const res = await (this.api as any).uploadAvatar$(file).toPromise();
      const url = (res as any)?.url || (res as any)?.avatarUrl || null;
      if (url) {
        this.form.controls.avatarUrl.setValue(url);
      }
    } catch (e: any) {
      this.error.set(e?.message || 'Error subiendo avatar');
    } finally {
      this.saving.set(false);
    }
  }

  clearPreview() { this.preview.set(null); }

  reset() {
    this.preview.set(null);
    this.ngOnInit(); // recarga desde el servidor
  }

  save() {
    if (this.form.invalid) return;
    this.error.set(null);
    this.saving.set(true);

    const dto = {
      displayName: this.form.value.displayName ?? '',
      avatarUrl: this.form.value.avatarUrl ?? undefined
    };

    this.auth.updateProfile(dto).subscribe({
      next: (u) => {
        // updateProfile ya devuelve AppUser mapeado
        this.auth.user.set({ id: u.id, name: u.name, avatarUrl: u.avatarUrl });
        this.preview.set(null);
        this.saving.set(false);
        // opcional: toast
        alert('Perfil actualizado');
      },
      error: (e) => {
        this.error.set(e?.error?.message || 'No se pudo guardar los cambios');
        this.saving.set(false);
      }
    });
  }
}
