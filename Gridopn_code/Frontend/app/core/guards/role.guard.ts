// src/app/core/guards/role.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, CanLoad, ActivatedRouteSnapshot, Route, Router } from '@angular/router';
import { TokenStorageService } from '../services/token-storage.service';
import { MENU } from 'src/app/layouts/sidebar/menu';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate, CanLoad {

  constructor(private storage: TokenStorageService, private router: Router) {}

  private checkRole(allowed: string[] = [], denied: string[] = []): boolean {
    const role = (this.storage.getRole() || '').toString();

    // if no role/session -> go to login
    if (!role) {
      // clear any stale storage
      this.storage.clearUser();
      this.router.navigate(['/auth/login']);
      return false;
    }

    // If denied list contains role → block
    if (denied && denied.length && denied.includes(role)) {
      this.router.navigate(['/']); // go to app root (or choose a safe page)
      return false;
    }

    // If allowed list exists, only those roles allowed
    if (allowed && allowed.length && !allowed.includes(role)) {
      this.router.navigate(['/']); // go to app root (or choose a safe page)
      return false;
    }

    return true;
  }

canActivate(route: ActivatedRouteSnapshot): boolean {
  const allowed = route.data?.['allowRoles'] || route.data?.['roles'] || [];
  const denied = route.data?.['denyRoles'] || [];

  const user = this.storage.getUser();

  if (!user || !user.role) {
    this.router.navigate(['/404-cover']);
    return false;
  }

  const role = user.role.toLowerCase();

  //  If role is in denied list → block
  if (denied.includes(role)) {
    this.router.navigate(['/errors/404-basic']);
    return false;
  }

  //  If allow list exists and user not in allowed → block
  if (allowed.length > 0 && !allowed.includes(role)) {
    this.router.navigate(['/errors/404-basic']);
    return false;
  }

  //  Authorized user
  return true;
}


  canLoad(route: Route): boolean {
    const allowed = (route.data as any)?.allowRoles || [];
    const denied = (route.data as any)?.denyRoles || [];
    return this.checkRole(allowed, denied);
  }



  // -----------------------------------------------
  // Evaluate menu.ts rules (role + permission)
  // -----------------------------------------------
  private evaluateAccess(path: string, user: any): boolean {
    const match = this.findMenuMatch(path, MENU);

    // If not found in menu → default allow
    if (!match) return true;

    const role = (user.role || '').toLowerCase();
    const perms = (user.permissions || []).map((p: string) => p.toLowerCase());

    // ----- ROLE CHECK -----
    if (match.allowRoles?.length && !match.allowRoles.includes(role)) {
      this.router.navigate(['/']);
      return false;
    }

    // ----- PERMISSION CHECK -----
    if (match.requiredPermissions?.length) {
      const ok = match.requiredPermissions.some((p: string) =>
        perms.includes(p.toLowerCase())
      );

      if (!ok) {
        this.router.navigate(['/']);
        return false;
      }
    }

    return true;
  }

  // -----------------------------------------------
  // Match route with menu item
  // -----------------------------------------------
  private findMenuMatch(path: string, items: any[]): any {
    const cleanPath = path.replace('//', '/').trim();

    for (const item of items) {
      if (item.link === cleanPath) return item;

      if (item.subItems) {
        const found = this.findMenuMatch(cleanPath, item.subItems);
        if (found) return found;
      }
    }
    return null;
  }
}
