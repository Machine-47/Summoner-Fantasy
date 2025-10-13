import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, map, of, tap } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.me().pipe(
    tap(res => auth.user.set({ id: res.id, name: res.name })),
    map(() => true),
    catchError(() => { router.navigateByUrl('/login'); return of(false); })
  );
};
