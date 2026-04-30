import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const isAuthUrl = req.url.includes('/refresh-token') || req.url.includes('/login') || req.url.includes('/logout');
      if (error.status === 401 && !isAuthUrl) {
        // Token might be expired, try to refresh
        return authService.refreshToken().pipe(
          switchMap((res) => {
            // Retry the request with the new token
            const newToken = res.token;
            const retriedReq = req.clone({
              setHeaders: { Authorization: `Bearer ${newToken}` }
            });
            return next(retriedReq);
          }),
          catchError((refreshErr) => {
            // If refresh fails, logout
            authService.logout();
            return throwError(() => refreshErr);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
