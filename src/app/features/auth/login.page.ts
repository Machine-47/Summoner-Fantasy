import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [FormsModule],
  template: `
    <section class="max-w-md mx-auto card space-y-4">
      <h2 class="text-xl font-bold">Iniciar sesión</h2>
      <form (ngSubmit)="submit()" class="space-y-3">
        <input class="input" [(ngModel)]="email" name="email" type="email" placeholder="Email" required>
        <input class="input" [(ngModel)]="password" name="password" type="password" placeholder="Password" required>
        <button class="btn btn-primary w-full">Entrar</button>
      </form>
    </section>
  `
})
export class LoginPage {
  private auth = inject(AuthService);
  private router = inject(Router);
  email = ''; password = '';

  submit() {
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => this.router.navigateByUrl('/'),
      error: () => alert('Credenciales no válidas')
    });
  }
}
