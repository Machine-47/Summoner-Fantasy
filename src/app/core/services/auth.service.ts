import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private base = environment.apiBaseUrl;

  user = signal<{ id: string; name: string } | null>(null);

  register(dto: { email: string; password: string; displayName: string }) {
    return this.http.post(`${this.base}/auth/register`, dto, { withCredentials: true });
  }
  login(dto: { email: string; password: string }) {
    return this.http.post<any>(`${this.base}/auth/login`, dto, { withCredentials: true });
  }
  me() {
    return this.http.get<any>(`${this.base}/auth/me`, { withCredentials: true });
  }
  refresh() {
    return this.http.post<any>(`${this.base}/auth/refresh`, {}, { withCredentials: true });
  }
  logout() {
    return this.http.post(`${this.base}/auth/logout`, {}, { withCredentials: true });
  }

  getProfile() {
  return this.http.get<any>(`${this.base}/users/me`, { withCredentials: true });
}
updateProfile(dto: { displayName?: string; avatarUrl?: string }) {
  return this.http.put<any>(`${this.base}/users/me`, dto, { withCredentials: true });
}
}
