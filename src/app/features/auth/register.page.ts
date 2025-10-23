import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-register-page',
  imports: [ReactiveFormsModule, RouterLink, NgIf],
  template: `
<div class="min-h-screen relative overflow-hidden">
  <div class="pointer-events-none absolute inset-0">
    <div class="absolute -top-1/4 left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] rounded-full blur-3xl opacity-30"
         style="background: radial-gradient(50% 50% at 50% 50%, #8b1fa8 0%, rgba(139,31,168,0.3) 40%, transparent 70%);"></div>
    <div class="absolute -bottom-1/3 right-0 w-[900px] h-[900px] rounded-full blur-3xl opacity-30"
         style="background: radial-gradient(50% 50% at 50% 50%, #ff2e74 0%, rgba(255,46,116,0.25) 45%, transparent 70%);"></div>
  </div>

  <div class="relative z-10 flex items-center justify-center px-4 py-10">
    <div class="w-full max-w-md space-y-6">
      <div class="text-center select-none">
        <h1 class="font-display text-3xl font-extrabold tracking-tight">
          <span class="bg-gradient-to-r from-[#ff2e74] to-[#7d0c87] bg-clip-text text-transparent">Crear cuenta</span>
        </h1>
      </div>

      <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-3">
        <div>
          <input formControlName="displayName" type="text" placeholder="Nombre de invocador"
                 class="w-full h-12 rounded-xl bg-black/40 border border-white/10 text-white px-4 placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#7d0c87]"/>
          <div *ngIf="showErr('displayName')" class="text-xs text-rose-400 mt-1">Mínimo 3 caracteres.</div>
        </div>

        <div>
          <input formControlName="email" type="email" placeholder="Email"
                 class="w-full h-12 rounded-xl bg-black/40 border border-white/10 text-white px-4 placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#7d0c87]"/>
          <div *ngIf="showErr('email')" class="text-xs text-rose-400 mt-1">Introduce un email válido.</div>
        </div>

        <div class="relative">
          <input [type]="showPwd() ? 'text' : 'password'" formControlName="password" placeholder="Contraseña"
                 class="w-full h-12 rounded-xl bg-black/40 border border-white/10 text-white px-4 pr-10 placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#7d0c87]"/>
          <button type="button" (click)="showPwd.set(!showPwd())"
                  class="absolute inset-y-0 right-0 px-3 text-white/60 hover:text-white">👁️</button>
          <div *ngIf="showErr('password')" class="text-xs text-rose-400 mt-1">Mínimo 6 caracteres.</div>
        </div>

        <div class="relative">
          <input [type]="showPwd2() ? 'text' : 'password'" formControlName="password2" placeholder="Repite la contraseña"
                 class="w-full h-12 rounded-xl bg-black/40 border border-white/10 text-white px-4 pr-10 placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#7d0c87]"/>
          <button type="button" (click)="showPwd2.set(!showPwd2())"
                  class="absolute inset-y-0 right-0 px-3 text-white/60 hover:text-white">👁️</button>
          <div *ngIf="form.hasError('mismatch') && (form.get('password2')?.touched || form.touched)"
          class="text-xs text-rose-400 mt-1">Las contraseñas no coinciden.</div>

        </div>

        <!-- Avatar desactivado por ahora (sin backend). Cuando lo actives, muestra un input file aquí. -->

        <button type="submit" [disabled]="loading() || form.invalid"
                class="w-full h-12 rounded-xl bg-gradient-to-r from-[#7d0c87] to-[#ff2e74] text-white font-semibold shadow-md disabled:opacity-60">
          {{ loading() ? 'Creando…' : 'Registrarse' }}
        </button>

        <a routerLink="/auth/login" class="block text-center text-sm text-white/70 hover:text-white">¿Ya tienes cuenta? Inicia sesión</a>

        <div *ngIf="error()" class="text-center text-rose-400 text-sm">{{ error() }}</div>
      </form>
    </div>
  </div>
</div>
  `
})
export class RegisterPage {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  form = this.fb.group({
    displayName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    password2: ['', [Validators.required]],
  }, { validators: (group) => {
    const a = group.get('password')?.value, b = group.get('password2')?.value;
    return a && b && a !== b ? { mismatch: true } : null;
  }});

  showPwd = signal(false);
  showPwd2 = signal(false);
  loading = signal(false);
  error = signal<string | null>(null);

  showErr(name: string) {
    const c = this.form.get(name)!; return c.touched && c.invalid;
  }

  async submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true); this.error.set(null);
    try {
      const { displayName, email, password } = this.form.value;
      await this.auth.register({
        displayName: displayName!,
        email: email!,
        password: password!,
      }).toPromise();

      // Si tu backend ya deja la sesión iniciada con la cookie tras register, te mandará adentro directamente.
      // Si no, hacemos login inmediato:
      await this.auth.login({ email: email!, password: password! }).toPromise();

      this.router.navigateByUrl('/players');
    } catch (e: any) {
      this.error.set(e?.message || 'No fue posible crear la cuenta.');
    } finally {
      this.loading.set(false);
    }
  }
}
