import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-[560px] flex-col px-4 py-8 sm:px-8">
      <header className="mb-10">
        <p className="text-xs uppercase tracking-[0.22em] text-(--ink-soft)">
          BorderSafe Account
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-foreground">Welcome back</h1>
      </header>

      <section className="space-y-4 rounded-[28px] border border-white/70 bg-white/75 p-5 shadow-(--card-shadow) backdrop-blur">
        <label className="block text-sm text-(--ink-muted)" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          className="w-full rounded-2xl border border-(--border-soft) bg-(--surface-alt) px-4 py-3 text-sm outline-none ring-0"
          placeholder="you@example.com"
          type="email"
        />

        <label className="block text-sm text-(--ink-muted)" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          className="w-full rounded-2xl border border-(--border-soft) bg-(--surface-alt) px-4 py-3 text-sm outline-none ring-0"
          placeholder="Enter your password"
          type="password"
        />

        <button className="w-full rounded-2xl bg-(--action) px-4 py-3 text-sm font-semibold text-(--action-ink) transition hover:opacity-90">
          Sign In
        </button>
      </section>

      <p className="mt-6 text-center text-sm text-(--ink-muted)">
        New here?{" "}
        <Link className="font-medium text-foreground" href="/auth/signup">
          Create account
        </Link>
      </p>
    </main>
  );
}
