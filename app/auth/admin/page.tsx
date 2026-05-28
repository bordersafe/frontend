import { AuthRoleHub } from "../_components/auth-role-hub";

export default function AdminAuthPage() {
  return (
    <AuthRoleHub
      role="admin"
      title="Admin access is provisioned"
      subtitle="Admin and HITL accounts are not self-service signups. Use this route to sign in once your account has been provisioned."
      primaryAction={{ label: "Go to admin sign in", href: "/auth/login" }}
      secondaryAction={{ label: "Back to home", href: "/" }}
      notice="If you expect admin access, confirm that your account has the admin, super_admin, or hitl role assigned before signing in."
    />
  );
}
