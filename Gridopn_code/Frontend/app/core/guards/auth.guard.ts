import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { api_url } from '../helpers/urlentry';
import { TokenStorageService } from '../services/token-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

  constructor(
    private http: HttpClient,
    private router: Router,
    private tokenStore: TokenStorageService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {

    const storedUser = this.tokenStore.getUser();
    const storedToken = this.tokenStore.getSessionToken();

    if (storedUser && storedToken) {
      return this.handleRedirect(storedUser, state.url);
    }

    return this.http.get<any>(`${api_url}/me`, { withCredentials: true }).pipe(
      map(res => {
        if (res?.status === 'success') {
          this.tokenStore.setUser(res);
          return true;
        }
        this.router.navigate(['/auth/login']);
        return false;
      }),
      catchError(() => {
        this.tokenStore.clearUser();
        this.router.navigate(['/auth/login']);
        return of(false);
      })
    );
  }

  /**  MAIN ROLE-BASED REDIRECTION LOGIC */
  private handleRedirect(user: any, url: string): Observable<boolean> {
    const role = (user.role || '').toLowerCase();

    const dashboardRoutes = [
      '/',                       // Homepage
      '/data-status',
      // '/analytics',
      // '/forecasted-data',
      // '/actual-data'
    ];

    //  For t_user: block all dashboard-related pages
    if (role === 't_user') {
      if (dashboardRoutes.includes(url) || url === '' || url === '/') {
        this.router.navigate(['/timingentry/pending']);
        return of(false);
      }
    }

    return of(true);
  }
}
