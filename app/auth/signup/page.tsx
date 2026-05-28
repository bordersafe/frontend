import { Suspense } from "react";
import { AuthSignupView } from "../_components/auth-signup-view";

export default function SignupPage() {
  return (
    <Suspense fallback={<div />}>
      <AuthSignupView />
    </Suspense>
  );
}
