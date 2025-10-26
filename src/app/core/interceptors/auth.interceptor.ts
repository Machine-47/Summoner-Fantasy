import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const withCreds = req.clone({ withCredentials: true });

    const token = localStorage.getItem('sf_token');
    const authReq = token
      ? withCreds.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : withCreds;

    return next.handle(authReq);
  }
}
