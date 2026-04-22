import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const adminAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const auth  = inject(AuthService);
  
    if (!req.url.includes('/api/admin')) {
    return next(req);
  }

  const token = auth.getAdminToken();

// Chỉ gắn token admin vào request — không gắn token user
  const authReq = token && !req.url.includes('/auth/')
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && !req.url.includes('/auth/')) {
        return auth.refreshAdminToken().pipe(
          switchMap(res => {
            localStorage.setItem('adminAccessToken', res.data.accessToken);
            const retry = req.clone({
              setHeaders: { Authorization: `Bearer ${res.data.accessToken}` }
            });
            return next(retry);
          }),
          catchError(() => { auth.adminLogout(); return throwError(() => err); })
        );
      }
      return throwError(() => err);
    })
  );
};
