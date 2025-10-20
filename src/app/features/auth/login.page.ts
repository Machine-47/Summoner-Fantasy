import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, RouterLink, NgIf],
  template: `
<div class="min-h-[100dvh] bg-[#0b0b0f] relative overflow-hidden">
  <!-- Fondos -->
  <div class="pointer-events-none absolute inset-0">
    <div class="absolute -top-1/4 left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] rounded-full blur-3xl opacity-30"
         style="background: radial-gradient(50% 50% at 50% 50%, #8b1fa8 0%, rgba(139,31,168,0.3) 40%, transparent 70%);"></div>
    <div class="absolute -bottom-1/3 right-0 w-[900px] h-[900px] rounded-full blur-3xl opacity-30"
         style="background: radial-gradient(50% 50% at 50% 50%, #ff2e74 0%, rgba(255,46,116,0.25) 45%, transparent 70%);"></div>
  </div>

  <div class="relative z-10 flex items-center justify-center px-4 py-10">
    <div class="w-full max-w-md space-y-6">
      <div class="text-center select-none">
        <div class="mx-auto mb-6 w-20 h-20 rounded-2xl bg-gradient-to-br from-[#ff2e74] to-[#7d0c87] grid place-content-center shadow-[0_0_40px_rgba(125,12,135,0.35)]">
          <svg viewBox="0 0 24 24" class="w-10 h-10 text-white"><path fill="currentColor" d="M12 2l7 10-7 10-7-10 7-10m0 5l-3.5 5L12 17l3.5-5L12 7z"/></svg>
        </div>
        <h1 class="font-display text-3xl font-extrabold tracking-tight">
          <span class="bg-gradient-to-r from-[#ff2e74] to-[#7d0c87] bg-clip-text text-transparent">SUMMONER</span>
          <span class="text-white"> FANTASY</span>
        </h1>
      </div>

      <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-3">
        <div>
          <input formControlName="email" type="email" autocomplete="email" placeholder="Email"
                 class="w-full h-12 rounded-xl bg-black/40 border border-white/10 text-white px-4 placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#7d0c87]"/>
          <div *ngIf="showErr('email')" class="text-xs text-rose-400 mt-1">Introduce un email válido.</div>
        </div>

        <div class="relative">
          <input [type]="showPwd() ? 'text' : 'password'"
                 formControlName="password" autocomplete="current-password" placeholder="Contraseña"
                 class="w-full h-12 rounded-xl bg-black/40 border border-white/10 text-white px-4 pr-10 placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#7d0c87]"/>
          <button type="button" (click)="showPwd.set(!showPwd())"
                  class="absolute inset-y-0 right-0 px-3 text-white/60 hover:text-white">👁️</button>
          <div *ngIf="showErr('password')" class="text-xs text-rose-400 mt-1">Mínimo 6 caracteres.</div>
        </div>

        <button type="submit" [disabled]="loading() || form.invalid"
                class="w-full h-12 rounded-xl bg-gradient-to-r from-[#7d0c87] to-[#ff2e74] text-white font-semibold shadow-md disabled:opacity-60">
          {{ loading() ? 'Entrando…' : 'Continuar' }}
        </button>

        <div class="text-center text-white/50 text-xs">o</div>

        <a routerLink="/auth/register"
           class="w-full h-12 grid place-content-center rounded-xl border border-white/15 bg-white/5 text-white hover:bg-white/10">
          Crear cuenta
        </a>
      </form>

      <div *ngIf="error()" class="text-center text-rose-400 text-sm">{{ error() }}</div>
    </div>
  </div>
</div>
  `
})
export class LoginPage {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  showPwd = signal(false);
  loading = signal(false);
  error = signal<string | null>(null);

  showErr(name: string) {
    const c = this.form.get(name)!; return c.touched && c.invalid;
  }

  async submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true); this.error.set(null);
    try {
      const { email, password } = this.form.value;
      await this.auth.login({ email: email!, password: password! }).toPromise();
      this.router.navigateByUrl('/players');
    } catch (e: any) {
      this.error.set(e?.message || 'No fue posible iniciar sesión.');
    } finally {
      this.loading.set(false);
    }
  }
}
