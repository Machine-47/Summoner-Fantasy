import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const withCreds = req.clone({ withCredentials: true });

  return next(withCreds).pipe(
    catchError(err => {
      if (err.status === 401 && !req.url.endsWith('/auth/refresh')) {
        return auth.refresh().pipe(
          switchMap(() => next(withCreds))
        );
      }
      return throwError(() => err);
    })
  );
};
