"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { type FormEvent, useState } from "react";

import { apiClient } from "@/lib/api/client";
import { firebaseAuth } from "@/lib/firebase";
import { getRedirectPathForRoles } from "../roles";

const DEFAULT_TITLE = "Welcome back";
const DEFAULT_SUBTITLE =
  "Sign in to track escrow states, review evidence, and move money with confidence.";

/** Map Firebase auth error codes to friendly copy. */
function friendlyAuthError(err: unknown): string {
  const code =
    err instanceof Error && "code" in err ? (err as { code: string }).code : "";
  switch (code) {
    case "auth/wrong-password":
    case "auth/invalid-credential":
    case "auth/user-not-found":
      return "Incorrect email or password. Please try again.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a few minutes then try again.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    case "auth/popup-closed-by-user":
      return "Sign-in popup was closed. Please try again.";
    case "auth/user-disabled":
      return "This account has been disabled. Contact support for help.";
    default:
      return err instanceof Error
        ? err.message
        : "Unable to sign in. Please try again.";
  }
}

async function fetchUserRolesAndRedirect(idToken: string): Promise<string> {
  const profile = await apiClient.get<{ roles?: string[] }>("/api/auth/me", {
    authToken: idToken,
  });
  return getRedirectPathForRoles(profile.roles || []);
}

export function AuthLoginView() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const isBusy = isSubmitting || isGoogleSubmitting || isResetting;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim() || !password) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await signInWithEmailAndPassword(
        firebaseAuth,
        email.trim(),
        password,
      );
      const idToken = await result.user.getIdToken();
      const redirectTo = await fetchUserRolesAndRedirect(idToken);
      router.push(redirectTo);
    } catch (err) {
      setError(friendlyAuthError(err));
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
      const result = await signInWithPopup(firebaseAuth, provider);
      const idToken = await result.user.getIdToken();
      const redirectTo = await fetchUserRolesAndRedirect(idToken);
      router.push(redirectTo);
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError("Enter your email address above, then click 'Forgot password'.");
      return;
    }
    setIsResetting(true);
    setError(null);
    try {
      await sendPasswordResetEmail(firebaseAuth, email.trim());
      setResetSent(true);
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <main className="page-shell grid min-h-full gap-8 px-4 py-8 sm:px-8 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="relative overflow-hidden rounded-4xl p-7 text-(--action-ink) shadow-(--shell-shadow)">
        <div className="absolute inset-0 section-emerald" />
        <div className="relative space-y-6">
          <div>
            <h1 className="heading-1">{DEFAULT_TITLE}</h1>
            <p className="mt-3 text-sm text-(--action-ink-dim)">{DEFAULT_SUBTITLE}</p>
          </div>
          <div className="panel-strong p-4 text-sm text-(--action-ink)">
            <p className="text-base font-semibold">Your workspace awaits</p>
            <p className="mt-2 text-xs text-(--action-ink-dim)">
              Sign in to access your buyer, seller, or admin workspace based on your account roles.
            </p>
          </div>
          <div className="text-xs text-(--action-ink-dim)">
            <p>We'll automatically route you to the right workspace after you sign in.</p>
          </div>
        </div>
      </section>

      <section className="panel p-6">
        <div className="space-y-2">
          <h2 className="heading-2">Sign in</h2>
          <p className="mt-2 text-sm text-(--ink-muted)">Email and Google sign-in are both available.</p>
        </div>

        <button
          className="btn-secondary mt-5 flex w-full items-center justify-center gap-2 px-4 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
          onClick={handleGoogleSignIn}
          type="button"
          disabled={isBusy}
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full border border-(--border-soft) bg-white">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5">
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.3h6.5c-.3 1.4-1.1 2.6-2.3 3.4v2.8h3.7c2.2-2 3.6-5 3.6-8.2Z" />
              <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.7-2.8c-1 .7-2.3 1.2-4.2 1.2-3.2 0-5.9-2.1-6.9-5H1.3v3C3.3 21.4 7.4 24 12 24Z" />
              <path fill="#FBBC05" d="M5.1 14.5c-.2-.7-.3-1.4-.3-2.2s.1-1.5.3-2.2V7.1H1.3C.5 8.7 0 10.5 0 12.3s.5 3.6 1.3 5.2l3.8-3Z" />
              <path fill="#EA4335" d="M12 4.8c1.8 0 3.4.6 4.6 1.8l3.4-3.4C17.9 1.2 15.2 0 12 0 7.4 0 3.3 2.6 1.3 7.1l3.8 3c1-2.9 3.7-5.3 6.9-5.3Z" />
            </svg>
          </span>
          {isGoogleSubmitting ? "Connecting…" : "Continue with Google"}
        </button>

        <div className="mt-4 flex items-center gap-3 text-xs text-(--ink-soft)">
          <span className="h-px flex-1 bg-(--border-soft)" />
          <span>or use email</span>
          <span className="h-px flex-1 bg-(--border-soft)" />
        </div>

        {/* Error banner — visible and prominent */}
        {error && (
          <div
            role="alert"
            className="panel-danger mt-4 flex items-start gap-3 p-4 text-sm text-(--danger)"
          >
            <svg
              aria-hidden="true"
              className="mt-0.5 h-4 w-4 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {resetSent && (
          <div
            role="status"
            className="panel-success mt-4 p-4 text-sm text-(--success)"
          >
            Password reset email sent to <strong>{email}</strong>. Check your inbox.
          </div>
        )}

        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-(--ink-muted)" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              className="input-field mt-1 w-full"
              placeholder="you@example.com"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-(--ink-muted)" htmlFor="password">
                Password
              </label>
              <button
                type="button"
                className="text-xs font-semibold text-(--primary) hover:underline disabled:opacity-60"
                onClick={handleForgotPassword}
                disabled={isBusy}
              >
                {isResetting ? "Sending…" : "Forgot password?"}
              </button>
            </div>
            <input
              id="password"
              className="input-field mt-1 w-full"
              placeholder="Enter your password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <button
            className="btn-primary w-full px-4 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!email.trim() || !password || isBusy}
            type="submit"
          >
            {isSubmitting ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-(--ink-muted)">
          New here?{" "}
          <Link className="font-medium text-foreground" href="/auth/signup">
            Create account
          </Link>
        </p>

        <p className="mt-3 text-center text-xs text-(--ink-soft)">
          Need a dedicated path?{" "}
          <Link className="font-medium text-foreground" href="/auth/buyer/signup">
            Buyer signup
          </Link>
          {" · "}
          <Link className="font-medium text-foreground" href="/auth/seller/signup">
            Seller signup
          </Link>
        </p>
      </section>
    </main>
  );
}
