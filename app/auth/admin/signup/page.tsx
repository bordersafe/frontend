import { AuthRoleHub } from "../../_components/auth-role-hub";

export default function AdminSignupPage() {
  return (
    <AuthRoleHub
      role="admin"
      title="Admin signup is not self-service"
      subtitle="Admin access is assigned by the team, then you can use the regular sign-in flow to reach the review queue."
      primaryAction={{ label: "Go to admin sign in", href: "/auth/login" }}
      secondaryAction={{ label: "Back to admin access", href: "/auth/admin" }}
      notice="This route now points users back to the correct admin access path instead of a generic signup form."
    />
  );
}
