import Link from "next/link";

export default function SignupPage() {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-[560px] flex-col px-4 py-8 sm:px-8">
      <header className="mb-10">
        <p className="text-xs uppercase tracking-[0.22em] text-(--ink-soft)">
          BorderSafe Onboarding
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-foreground">Create your account</h1>
      </header>

      <section className="space-y-4 rounded-[28px] border border-white/70 bg-white/75 p-5 shadow-(--card-shadow) backdrop-blur">
        <input
          className="w-full rounded-2xl border border-(--border-soft) bg-(--surface-alt) px-4 py-3 text-sm"
          placeholder="Full name"
          type="text"
        />
        <input
          className="w-full rounded-2xl border border-(--border-soft) bg-(--surface-alt) px-4 py-3 text-sm"
          placeholder="Email"
          type="email"
        />
        <input
          className="w-full rounded-2xl border border-(--border-soft) bg-(--surface-alt) px-4 py-3 text-sm"
          placeholder="Password"
          type="password"
        />
        <button className="w-full rounded-2xl bg-(--action) px-4 py-3 text-sm font-semibold text-(--action-ink) transition hover:opacity-90">
          Create account
        </button>
      </section>

      <p className="mt-6 text-center text-sm text-(--ink-muted)">
        Already have an account?{" "}
        <Link className="font-medium text-foreground" href="/auth/login">
          Sign in
        </Link>
      </p>
    </main>
  );
}
