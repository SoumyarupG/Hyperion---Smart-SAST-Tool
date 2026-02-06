// src/app/core/services/menu-filter.service.ts
import { Injectable } from '@angular/core';
import { MenuItem } from 'src/app/layouts/sidebar/menu.model';

@Injectable({
  providedIn: 'root'
})
export class MenuFilterService {

  filterMenu(items: MenuItem[], user: any): MenuItem[] {
    if (!items || items.length === 0) return [];
    if (!user) return [];

    const userRole = (user.role || "").toLowerCase();
    const userName = (user.username || user.user || "").toLowerCase();
    const userState = user.state_id ?? null;

    const userPermissions: string[] = (user.permissions || [])
      .map((p: string) => (p || '').toLowerCase());

    return items
      .map(item => this.filterItem(item, userRole, userName, userState, userPermissions))
      .filter(i => i !== null) as MenuItem[];
  }

  private filterItem(
    item: MenuItem,
    userRole: string,
    userName: string,
    userState: any,
    userPermissions: string[]
  ): MenuItem | null {

    const copy: MenuItem = { ...item };
    let visible = true;

    // ============================================================
    // 1️⃣ STRICT ROLE CHECK
    // ============================================================
    if (copy.allowRoles && copy.allowRoles.length > 0) {
      const allowed = copy.allowRoles.map(r => r.toLowerCase());
      if (!allowed.includes(userRole)) return null;   // <<< HARD FILTER
    }

    // ============================================================
    // 2️⃣ PERMISSION CHECK (optional)
    // ============================================================
    if (copy.requiredPermissions && copy.requiredPermissions.length > 0) {
      const required = copy.requiredPermissions.map(p => p.toLowerCase());
      const hasPermission = required.some(p => userPermissions.includes(p));
      if (!hasPermission) return null;
    }

    // ============================================================
    // 3️⃣ USER / STATE FILTERS (optional)
    // ============================================================
    if (copy.allowUsers && !copy.allowUsers.map(u => u.toLowerCase()).includes(userName)) {
      return null;
    }
    if (copy.denyUsers && copy.denyUsers.map(u => u.toLowerCase()).includes(userName)) {
      return null;
    }

    if (copy.allowStates && !copy.allowStates.includes(userState)) {
      return null;
    }
    if (copy.denyStates && copy.denyStates.includes(userState)) {
      return null;
    }

    // ============================================================
    // 4️⃣ FILTER SUB-MENUS RECURSIVELY
    // ============================================================
    if (copy.subItems && Array.isArray(copy.subItems)) {
      copy.subItems = copy.subItems
        .map(sub => this.filterItem(sub, userRole, userName, userState, userPermissions))
        .filter(sub => sub !== null) as MenuItem[];

      // If no subitems remain & parent has no link → hide parent
      if (copy.subItems.length === 0 && !copy.link) {
        return null;
      }
    }

    return copy;
  }
}
