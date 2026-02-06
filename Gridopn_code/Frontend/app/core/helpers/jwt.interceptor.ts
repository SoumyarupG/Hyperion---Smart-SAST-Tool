import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { TokenStorageService } from '../services/token-storage.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  constructor(
    private router: Router,
    private storage: TokenStorageService
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const sessionToken = this.storage.getSessionToken();
    const deviceId = this.storage.getDeviceId();

    request = request.clone({
      setHeaders: {
        'X-Session-Token': sessionToken || '',
        'Device-ID': deviceId || ''
      },
      withCredentials: true
    });

    return next.handle(request).pipe(
      catchError(err => {
        if (err.status === 401) {
          this.storage.clearUser();
          this.router.navigate(['/login']);
        }
        return throwError(() => err);
      })
    );
  }
}
