import { Injectable } from '@angular/core';

const USER_KEY = 'currentUser';
const DEVICE_KEY = 'device_id';
const SESSION_KEY = 'session_token';


@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {

  constructor() {}

  // -------- USER --------
  public setUser(user: any): void {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  public getUser(): any {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  public clearUser(): void {
    localStorage.removeItem(USER_KEY);
  }

  // -------- SESSION TOKEN --------
  public setSessionToken(token: string): void {
    if (token) localStorage.setItem(SESSION_KEY, token);
  }

  public getSessionToken(): string | null {
    return localStorage.getItem(SESSION_KEY);
  }

  // -------- DEVICE ID (PERSISTENT) --------
  public setDeviceId(id: string): void {
    if (id) {
      localStorage.setItem(DEVICE_KEY, id);
    }
  }

  public getDeviceId(): string {
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id) {
      // generate one if missing
      id = this.generateUUID();
      localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  // -------- LOGOUT --------
  public signOut(): void {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(SESSION_KEY);
    // DO NOT remove device_id — backend requires stability
  }

  // ---- helper getters used by UI ----
  public getPermissions(): string[] {
    const perms = this.getUser()?.permissions || [];
    // normalize to lowercase strings for easier comparison
    return (perms as any[]).map((p: any) => (p || '').toString().toLowerCase());
  }

  public getRole(): string {
    return this.getUser()?.role || '';
  }
}