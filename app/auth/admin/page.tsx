import { Suspense } from "react";
import { AuthLoginView } from "../_components/auth-login-view";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div />}>
      <AuthLoginView role="admin" />
    </Suspense>
  );
}
