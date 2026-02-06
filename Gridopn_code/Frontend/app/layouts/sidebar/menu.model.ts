// src/app/layouts/menu.model.ts
export interface MenuItem {
  id: number;
  label: string;
  icon?: string;
  link?: string;
  isTitle?: boolean;
  parentId?: number;

  subItems?: MenuItem[];

  // --- ROLE / USER / STATE BASED FILTERS ---
  allowRoles?: string[];   // only these roles can see
  denyRoles?: string[];    // these roles cannot see

  allowUsers?: string[];   // specific usernames allowed
  denyUsers?: string[];    // specific usernames denied

  allowStates?: number[];  // state-based visibility
  denyStates?: number[];

  badge?: { text: string; variant: string };

  // --- PERMISSION BASED RBAC (NEW) ---
  requiredPermissions?: string[];  // permission keys from DB (e.g., "upload_dayahead")
}
