import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError, BehaviorSubject, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { api_url } from '../helpers/urlentry';
import { ToastService } from 'src/app/account/login/toast-service';
import { Router } from '@angular/router';
import { TokenStorageService } from './token-storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;

  constructor(
    private http: HttpClient,
    private toastService: ToastService,
    private router: Router,
    private storage: TokenStorageService
  ) {
    this.currentUserSubject = new BehaviorSubject<any>(this.storage.getUser());
    this.currentUser = this.currentUserSubject.asObservable();
  }

  get currentUserValue() {
    return this.currentUserSubject.value;
  }

login(username: string, password: string, captcha: string): Observable<any> {

  const deviceId = this.storage.getDeviceId() || '';

  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Device-ID': deviceId
  });

  return this.http.post<any>(
    `${api_url}/login`,
    { username, password, recaptcha: captcha },
    {
      headers,
      withCredentials: true,
      observe: 'response'
    }
  ).pipe(

    map(response => {
      const body = response.body || {};   // <-- ALWAYS USE BODY

      // Validate backend response
      if (!body || body.status === 'failure') {
        this.toastService.show(body?.error || 'Login failed', {
          classname: 'bg-danger text-white',
          delay: 5000
        });
        return null;
      }

      // ensure permissions default to []
      const perms = body.permissions || [];

      this.storage.setUser({
        user: body.user,
        username: body.username,
        role: body.role,
        state_id: body.state_id,
        permissions: perms
      });

      // ------------ SAVE TOKENS -------------
      if (body.session_token) {
        this.storage.setSessionToken(body.session_token);
      }

      if (body.device_id) {
        this.storage.setDeviceId(body.device_id);
      }

      // Notify subscribers (Sidebar uses this)
      this.currentUserSubject.next(this.storage.getUser());

      return body;
    }),

    catchError(err => {
      this.toastService.show(
        'An error occurred during login',
        { classname: 'bg-danger text-white', delay: 5000 }
      );
      return throwError(() => err);
    })
  );
}



  me() {
    const token = this.storage.getSessionToken();
    const device = this.storage.getDeviceId();

    return this.http.get<any>(`${api_url}/me`, {
      headers: {
        'X-Session-Token': token || '',
        'Device-ID': device || ''
      },
      withCredentials: true
    });
  }

    logout() {
      this.storage.clearUser();
      this.currentUserSubject.next(null);
      // go to auth login page
      this.router.navigate(['/auth/login']);
    }


  isAuthenticatedSync() {
    return !!this.currentUserSubject.value;
  }

  // inside AuthenticationService class

  /** call when you change localStorage externally and want auth.observable to emit */
  public refreshCurrentUserFromStorage(): void {
    const stored = this.storage.getUser() || null;
    // emit stored user (or null)
    this.currentUserSubject.next(stored);
  }

}
