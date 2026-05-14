import { Suspense } from "react";
import { AuthLoginView } from "../_components/auth-login-view";

export default function SellerLoginPage() {
  return (
    <Suspense fallback={<div />}>
      <AuthLoginView role="seller" />
    </Suspense>
  );
}
