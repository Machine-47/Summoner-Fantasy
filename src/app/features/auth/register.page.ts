import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [FormsModule],
  template: `
    <section class="max-w-md mx-auto card space-y-4">
      <h2 class="text-xl font-bold">Crear cuenta</h2>
      <form (ngSubmit)="submit()" class="space-y-3">
        <input class="input" [(ngModel)]="displayName" name="displayName" placeholder="Nombre a mostrar" required>
        <input class="input" [(ngModel)]="email" name="email" type="email" placeholder="Email" required>
        <input class="input" [(ngModel)]="password" name="password" type="password" placeholder="Password" required>
        <button class="btn btn-primary w-full">Registrarme</button>
      </form>
    </section>
  `
})
export class RegisterPage {
  private auth = inject(AuthService);
  private router = inject(Router);
  displayName = ''; email = ''; password = '';

  submit() {
    this.auth.register({ displayName: this.displayName, email: this.email, password: this.password })
      .subscribe({
        next: () => this.router.navigateByUrl('/login'),
        error: (e) => alert('No se pudo registrar: ' + (e.error?.[0]?.description ?? ''))
      });
  }
}
