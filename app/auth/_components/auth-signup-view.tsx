"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { GoogleAuthProvider, createUserWithEmailAndPassword, signInWithPopup, updateProfile } from "firebase/auth";
import { type FormEvent, useState } from "react";

import { firebaseAuth } from "@/lib/firebase";
import { apiClient } from "@/lib/api/client";
import { AUTH_ROLE_CONFIG, SIGNUP_ROLE_ORDER, type SignupRole, getRedirectPathForRoles } from "../roles";

const DEFAULT_TITLE = "Create your account";
const DEFAULT_SUBTITLE =
  "Sign up to start trading with protection, AI-assisted reviews, and auditable payouts.";

async function assignRoleToUser(idToken: string, role: SignupRole) {
  // Map frontend role names to backend role names
  const roleMap: Record<SignupRole, string> = {
    buyer: "customer",
    seller: "vendor",
  };

  const backendRole = roleMap[role];

  // Skip role assignment for buyer (already customer by default)
  if (role === "buyer") {
    return;
  }

  return apiClient.post(
    "/api/auth/assign-role",
    { role: backendRole },
    { authToken: idToken }
  );
}

async function fetchUserProfile(idToken: string) {
  return apiClient.get<{ roles?: string[] }>("/api/auth/me", { authToken: idToken });
}

type AuthSignupViewProps = {
  initialRole?: SignupRole;
  allowRoleSelection?: boolean;
};

export function AuthSignupView({ initialRole = "buyer", allowRoleSelection = true }: AuthSignupViewProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<SignupRole>(initialRole);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  const roleConfig = AUTH_ROLE_CONFIG[selectedRole];
  const isBusy = isSubmitting || isGoogleSubmitting;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || !email.trim() || !password || !selectedRole) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await createUserWithEmailAndPassword(
        firebaseAuth,
        email.trim(),
        password
      );
      await updateProfile(result.user, { displayName: name.trim() });

      // Get the ID token
      const idToken = await result.user.getIdToken();

      // Assign role if not buyer (buyer is default customer)
      if (selectedRole !== "buyer") {
        await assignRoleToUser(idToken, selectedRole);
      }

      // Get user profile to determine redirect
      const profile = await fetchUserProfile(idToken);
      const redirectTo = getRedirectPathForRoles(profile.roles || []);
      router.push(redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    if (isBusy) return;

    setIsGoogleSubmitting(true);
    setError(null);

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(firebaseAuth, provider);

      // Get the ID token
      const idToken = await result.user.getIdToken();

      // Assign role if not buyer
      if (selectedRole !== "buyer") {
        await assignRoleToUser(idToken, selectedRole);
      }

      // Get user profile to determine redirect
      const profile = await fetchUserProfile(idToken);
      const redirectTo = getRedirectPathForRoles(profile.roles || []);
      router.push(redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to continue with Google.");
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  return (
    <main className="page-shell grid min-h-full gap-8 px-4 py-8 sm:px-8 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="relative overflow-hidden rounded-4xl p-7 shadow-(--shell-shadow)">
        <div className="absolute inset-0 section-aurora" />
        <div className="relative space-y-6">
          <div>
            <h1 className="heading-1">{DEFAULT_TITLE}</h1>
            <p className="mt-3 text-sm text-(--ink-muted)">{DEFAULT_SUBTITLE}</p>
          </div>
          <div className="panel-strong p-4 text-sm">
            <p className="text-base font-semibold">{roleConfig?.focus ?? "Escrow oversight."}</p>
            <p className="mt-2 text-xs text-(--ink-muted)">{roleConfig?.description}</p>
          </div>
          <div className="text-xs text-(--ink-muted)">
            <p>Choose your role below. You can always switch roles later by contacting support.</p>
          </div>
        </div>
      </section>

      <section className="panel p-6">
        <div className="space-y-2">
          <h2 className="heading-2">Create account</h2>
          <p className="mt-2 text-sm text-(--ink-muted)">
            {allowRoleSelection ? "Choose your role and sign up." : `This flow is preconfigured for ${roleConfig.label.toLowerCase()}.`}
          </p>
        </div>

        {allowRoleSelection ? (
          <div className="mt-5 space-y-3">
            {SIGNUP_ROLE_ORDER.map((role) => {
              const config = AUTH_ROLE_CONFIG[role];
              return (
                <label
                  key={role}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border-2 p-3 transition-colors ${
                    selectedRole === role
                      ? "border-(--border-strong) bg-(--surface-highlight)"
                      : "border-(--border-soft) hover:border-(--border-medium)"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={role}
                    checked={selectedRole === role}
                    onChange={(e) => setSelectedRole(e.target.value as SignupRole)}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{config.label}</p>
                    <p className="text-xs text-(--ink-muted) mt-0.5">{config.description}</p>
                  </div>
                </label>
              );
            })}
          </div>
        ) : (
          <div className="mt-5 rounded-lg border border-(--border-soft) bg-(--surface-highlight) p-4 text-sm text-(--ink-muted)">
            <p className="font-semibold text-foreground">{roleConfig.label} signup</p>
            <p className="mt-1">The account type is fixed for this entry point so users stay on the correct onboarding path.</p>
          </div>
        )}

        <button
          className="btn-secondary mt-5 flex w-full items-center justify-center gap-2 px-4 py-3 text-sm"
          onClick={handleGoogleSignUp}
          type="button"
          disabled={isBusy}
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full border border-(--border-soft) bg-white">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5">
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.3h6.5c-.3 1.4-1.1 2.6-2.3 3.4v2.8h3.7c2.2-2 3.6-5 3.6-8.2Z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.7-2.8c-1 .7-2.3 1.2-4.2 1.2-3.2 0-5.9-2.1-6.9-5H1.3v3C3.3 21.4 7.4 24 12 24Z"
              />
              <path
                fill="#FBBC05"
                d="M5.1 14.5c-.2-.7-.3-1.4-.3-2.2s.1-1.5.3-2.2V7.1H1.3C.5 8.7 0 10.5 0 12.3s.5 3.6 1.3 5.2l3.8-3Z"
              />
              <path
                fill="#EA4335"
                d="M12 4.8c1.8 0 3.4.6 4.6 1.8l3.4-3.4C17.9 1.2 15.2 0 12 0 7.4 0 3.3 2.6 1.3 7.1l3.8 3c1-2.9 3.7-5.3 6.9-5.3Z"
              />
            </svg>
          </span>
          {isGoogleSubmitting ? "Connecting..." : "Continue with Google"}
        </button>

        <div className="mt-4 flex items-center gap-3 text-xs text-(--ink-soft)">
          <span className="h-px flex-1 bg-(--border-soft)" />
          <span>or use email</span>
          <span className="h-px flex-1 bg-(--border-soft)" />
        </div>

        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm text-(--ink-muted)" htmlFor="name">
            Full Name
          </label>
          <input
            id="name"
            className="input-field w-full"
            placeholder="Your name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />

          <label className="block text-sm text-(--ink-muted)" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            className="input-field w-full"
            placeholder="you@example.com"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <label className="block text-sm text-(--ink-muted)" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            className="input-field w-full"
            placeholder="Create a password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          <button
            className="btn-primary w-full px-4 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!name.trim() || !email.trim() || !password || isBusy}
            type="submit"
          >
            {isSubmitting ? "Creating account..." : "Create Account"}
          </button>

          {error && <p className="text-sm text-(--ink-muted)">{error}</p>}
        </form>

        <p className="mt-6 text-center text-sm text-(--ink-muted)">
          Already have an account?{" "}
          <Link className="font-medium text-foreground" href="/auth/login">
            Sign In
          </Link>
        </p>

        <p className="mt-3 text-center text-xs text-(--ink-soft)">
          Admin accounts are provisioned separately. Visit{" "}
          <Link className="font-medium text-foreground" href="/auth/admin">
            admin access
          </Link>
          {" "}if you were assigned an admin, super_admin, or hitl role.
        </p>
      </section>
    </main>
  );
}
