import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const userAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
    if (req.url.includes('/api/admin')) {
    return next(req);
  }
  const router = inject(Router);
  const token = authService.getUserToken();

 // Chỉ gắn token user vào request — không gắn token admin
  const authReq = token && !req.url.includes('/auth/')
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && !req.url.includes('/auth/')) {
        return authService.refreshUserToken().pipe(
          switchMap(res => {
            localStorage.setItem('accessToken', res.data.accessToken);
            const retry = req.clone({
              setHeaders: { Authorization: `Bearer ${res.data.accessToken}` }
            });
            return next(retry);
          }),
          catchError(() => { authService.logout(); return throwError(() => err); })
        );
      }
      return throwError(() => err);
    })
  );

};