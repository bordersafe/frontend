"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { type FormEvent, useMemo, useState } from "react";

import { firebaseAuth } from "@/lib/firebase";
import { AUTH_ROLE_CONFIG, type AuthRole } from "../roles";

type AuthLoginViewProps = {
  role?: AuthRole;
};

const DEFAULT_TITLE = "Welcome back";
const DEFAULT_SUBTITLE =
  "Sign in to track escrow states, review evidence, and move money with confidence.";

function resolveRole(value: string | null): AuthRole | null {
  if (value === "buyer" || value === "seller" || value === "admin") {
    return value;
  }
  return null;
}

export function AuthLoginView({ role }: AuthLoginViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  const resolvedRole = useMemo(() => {
    if (role) return role;
    return resolveRole(searchParams?.get("role") ?? null);
  }, [role, searchParams]);

  const roleConfig = resolvedRole ? AUTH_ROLE_CONFIG[resolvedRole] : null;
  const title = roleConfig?.loginTitle ?? DEFAULT_TITLE;
  const subtitle = roleConfig?.loginSubtitle ?? DEFAULT_SUBTITLE;
  const redirectTo = roleConfig?.redirectTo ?? "/dashboard";
  const isBusy = isSubmitting || isGoogleSubmitting;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim() || !password) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
      router.push(redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (isBusy) return;

    setIsGoogleSubmitting(true);
    setError(null);

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      await signInWithPopup(firebaseAuth, provider);
      router.push(redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in with Google.");
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  return (
    <main className="page-shell grid min-h-full gap-8 px-4 py-8 sm:px-8 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="relative overflow-hidden rounded-[32px] p-7 text-(--action-ink) shadow-(--shell-shadow)">
        <div className="absolute inset-0 section-emerald" />
        <div className="relative space-y-6">
          <div>
            <h1 className="heading-1">{title}</h1>
            <p className="mt-3 text-sm text-(--action-ink-dim)">{subtitle}</p>
          </div>
          <div className="panel-strong p-4 text-sm text-(--action-ink)">
            <p className="text-base font-semibold">{roleConfig?.focus ?? "Escrow oversight."}</p>
            {roleConfig && (
              <p className="mt-2 text-xs text-(--action-ink-dim)">{roleConfig.description}</p>
            )}
          </div>
          <div className="text-xs text-(--action-ink-dim)">
            {roleConfig ? (
              <p>Need a different workspace? Visit the auth hub to switch roles.</p>
            ) : (
              <p>Select a role to see a tailored workspace view.</p>
            )}
            <Link className="mt-3 inline-flex text-xs font-semibold text-(--action-ink)" href="/auth">
              Open role hub
            </Link>
          </div>
        </div>
      </section>

      <section className="panel p-6">
        <div className="space-y-2">
          <h2 className="heading-2">Sign in</h2>
          <p className="mt-2 text-sm text-(--ink-muted)">Email and Google sign-in are both available.</p>
        </div>

        <button
          className="btn-secondary mt-5 flex w-full items-center justify-center gap-2 px-4 py-3 text-sm"
          onClick={handleGoogleSignIn}
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
            placeholder="Enter your password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          <button
            className="btn-primary w-full px-4 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!email.trim() || !password || isBusy}
            type="submit"
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>

          {error && <p className="text-sm text-(--ink-muted)">{error}</p>}
        </form>

        <p className="mt-6 text-center text-sm text-(--ink-muted)">
          New here?{" "}
          <Link className="font-medium text-foreground" href="/auth/signup">
            Create account
          </Link>
        </p>
      </section>
    </main>
  );
}
