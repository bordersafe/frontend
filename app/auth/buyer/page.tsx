import { AuthRoleHub } from "../_components/auth-role-hub";

export default function BuyerAuthPage() {
  return (
    <AuthRoleHub
      role="buyer"
      title="Start as a buyer"
      subtitle="Sign in or create a buyer account to track escrows, confirm delivery, and request support when needed."
      primaryAction={{ label: "Create buyer account", href: "/auth/buyer/signup" }}
      secondaryAction={{ label: "Buyer sign in", href: "/auth/login" }}
      notice="Buyer accounts are routed into the escrow, trust center, and buyer dashboard flow after authentication."
    />
  );
}
