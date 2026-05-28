export type AuthRole = "buyer" | "seller" | "admin";
export type SignupRole = "buyer" | "seller";

type RoleConfig = {
  label: string;
  description: string;
  redirectTo: string;
  focus: string;
};

// Roles available for signup (excludes admin - assigned via script only)
export const SIGNUP_ROLE_ORDER: SignupRole[] = ["buyer", "seller"];

// All roles for redirect purposes
export const AUTH_ROLE_CONFIG: Record<AuthRole, RoleConfig> = {
  buyer: {
    label: "Buyer",
    description: "Track escrows, confirm delivery, and release funds only after the package matches expectations.",
    redirectTo: "/buyer",
    focus: "Delivery confirmation, proof review, and refund protection.",
  },
  seller: {
    label: "Vendor",
    description: "Create escrows, issue Squad virtual accounts, and monitor settlement from order to payout.",
    redirectTo: "/dashboard",
    focus: "Escrow creation, payment tracking, and seller payouts.",
  },
  admin: {
    label: "Admin",
    description: "Review AI advisories, resolve disputes, and finalize payout or refund decisions.",
    redirectTo: "/admin",
    focus: "Human review queue, payout control, and risk resolution.",
  },
};

/**
 * Get the redirect path for a user based on their roles.
 * Prioritizes admin > seller > buyer
 */
export function getRedirectPathForRoles(roles: string[]): string {
  if (roles.includes("admin") || roles.includes("hitl") || roles.includes("super_admin")) {
    return AUTH_ROLE_CONFIG.admin.redirectTo;
  }
  if (roles.includes("seller") || roles.includes("vendor")) {
    return AUTH_ROLE_CONFIG.seller.redirectTo;
  }
  return AUTH_ROLE_CONFIG.buyer.redirectTo;
}
