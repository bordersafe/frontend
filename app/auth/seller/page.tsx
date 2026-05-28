import { AuthRoleHub } from "../_components/auth-role-hub";

export default function SellerAuthPage() {
  return (
    <AuthRoleHub
      role="seller"
      title="Start as a seller"
      subtitle="Create a seller account to issue escrows, share Squad payment links, and follow settlement from order to payout."
      primaryAction={{ label: "Create seller account", href: "/auth/seller/signup" }}
      secondaryAction={{ label: "Seller sign in", href: "/auth/login" }}
      notice="Seller accounts are routed into the operations dashboard, store management, and escrow creation flow after authentication."
    />
  );
}
