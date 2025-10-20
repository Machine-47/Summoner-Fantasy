import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

export type AppUser = { id: string; name: string; avatarUrl?: string };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private base = environment.apiBaseUrl;

  // Estado reactivo del usuario (lo lee el NAV)
  user = signal<AppUser | null>(null);

  // ---------- Helpers ----------
  /** Normaliza el objeto user que devuelve el backend a nuestro AppUser */
  private mapUser = (u: any): AppUser => ({
    id: u?.id ?? u?.userId ?? '',
    name: u?.displayName ?? u?.name ?? u?.username ?? '',
    avatarUrl: u?.avatarUrl ?? u?.photoUrl ?? undefined,
  });

  /** Hace GET /auth/me y actualiza la señal user */
  private meSet(): Observable<AppUser> {
    return this.http.get<any>(`${this.base}/auth/me`, { withCredentials: true }).pipe(
      map(res => this.mapUser(res)),
      tap(mapped => this.user.set(mapped))
    );
  }

  // ---------- API pública ----------
  /** Intenta restaurar sesión al arrancar la app. No lanza error si no hay sesión */
  restore(): Observable<AppUser | null> {
    return this.http.get<any>(`${this.base}/auth/me`, { withCredentials: true }).pipe(
      map(res => this.mapUser(res)),
      tap(mapped => this.user.set(mapped)),
      catchError(() => {
        this.user.set(null);
        return of(null);
      })
    );
  }

  register(dto: { email: string; password: string; displayName: string }) {
    // Muchos backends solo devuelven cookie; luego hay que llamar a /auth/me
    return this.http.post(`${this.base}/auth/register`, dto, { withCredentials: true }).pipe(
      switchMap(() => this.meSet())
    );
  }

  login(dto: { email: string; password: string }) {
    return this.http.post<any>(`${this.base}/auth/login`, dto, { withCredentials: true }).pipe(
      switchMap(() => this.meSet())
    );
  }

  me() {
    // Si quieres obtener el perfil sin tocar la señal, usa este;
    // si quieres actualizar la señal, usa restore() o meSet()
    return this.http.get<any>(`${this.base}/auth/me`, { withCredentials: true });
  }

  refresh() {
    // Actualiza cookie y refresca user en memoria
    return this.http.post<any>(`${this.base}/auth/refresh`, {}, { withCredentials: true }).pipe(
      switchMap(() => this.meSet())
    );
  }

  logout() {
    return this.http.post(`${this.base}/auth/logout`, {}, { withCredentials: true }).pipe(
      tap(() => this.user.set(null))
    );
  }

  getProfile() {
    return this.http.get<any>(`${this.base}/users/me`, { withCredentials: true });
  }

  updateProfile(dto: { displayName?: string; avatarUrl?: string }) {
    return this.http.put<any>(`${this.base}/users/me`, dto, { withCredentials: true }).pipe(
      map(res => this.mapUser(res)),
      tap(mapped => this.user.set(mapped))
    );
  }
}
