import type { UserRole } from "./auth";

export function hasRole(roles: UserRole[] | undefined, role: UserRole): boolean {
  return roles?.includes(role) ?? false;
}

export function isAdmin(roles: UserRole[] | undefined): boolean {
  return hasRole(roles, "admin") || hasRole(roles, "hitl") || hasRole(roles, "super_admin");
}

export function isVendor(roles: UserRole[] | undefined): boolean {
  return hasRole(roles, "vendor");
}

export function isCustomer(roles: UserRole[] | undefined): boolean {
  return hasRole(roles, "customer");
}

export function canAccessAdminPanel(roles: UserRole[] | undefined): boolean {
  return isAdmin(roles);
}

export function canManageEscrows(roles: UserRole[] | undefined): boolean {
  return isAdmin(roles) || isVendor(roles) || isCustomer(roles);
}
