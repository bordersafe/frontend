import { Suspense } from "react";

import { AuthSignupView } from "../../_components/auth-signup-view";

export default function SellerSignupPage() {
  return (
    <Suspense fallback={<div />}>
      <AuthSignupView allowRoleSelection={false} initialRole="seller" />
    </Suspense>
  );
}
