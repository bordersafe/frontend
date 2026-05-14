import { Suspense } from "react";
import { AuthLoginView } from "../_components/auth-login-view";

export default function BuyerLoginPage() {
  return (
    <Suspense fallback={<div />}>
      <AuthLoginView role="buyer" />
    </Suspense>
  );
}
