export type AuthRole = "buyer" | "seller" | "admin";

type RoleConfig = {
  label: string;
  description: string;
  loginTitle: string;
  loginSubtitle: string;
  redirectTo: string;
  focus: string;
};

export const AUTH_ROLE_ORDER: AuthRole[] = ["buyer", "seller", "admin"];

export const AUTH_ROLE_CONFIG: Record<AuthRole, RoleConfig> = {
  buyer: {
    label: "Buyer",
    description: "Track escrows, confirm delivery, and release funds only after the package matches expectations.",
    loginTitle: "Buyer sign in",
    loginSubtitle: "Confirm delivery, review evidence, and keep your purchases protected.",
    redirectTo: "/escrow",
    focus: "Delivery confirmation, proof review, and refund protection.",
  },
  seller: {
    label: "Seller",
    description: "Create escrows, issue Squad virtual accounts, and monitor settlement from order to payout.",
    loginTitle: "Seller sign in",
    loginSubtitle: "Launch escrow requests and manage buyer payment details from one workspace.",
    redirectTo: "/dashboard",
    focus: "Escrow creation, payment tracking, and seller payouts.",
  },
  admin: {
    label: "Admin",
    description: "Review AI advisories, resolve disputes, and finalize payout or refund decisions.",
    loginTitle: "Admin sign in",
    loginSubtitle: "Resolve escalations with AI context, payment evidence, and human judgment.",
    redirectTo: "/admin",
    focus: "Human review queue, payout control, and risk resolution.",
  },
};
