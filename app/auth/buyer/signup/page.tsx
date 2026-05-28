import { Suspense } from "react";

import { AuthSignupView } from "../../_components/auth-signup-view";

export default function BuyerSignupPage() {
  return (
    <Suspense fallback={<div />}>
      <AuthSignupView allowRoleSelection={false} initialRole="buyer" />
    </Suspense>
  );
}
