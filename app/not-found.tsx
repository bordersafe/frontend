import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-full flex-col items-center justify-center px-6 text-center">
      <p className="text-xs uppercase tracking-[0.24em] text-(--ink-soft)">404</p>
      <h1 className="heading-1">Route not found</h1>
      <p className="mt-3 max-w-[28ch] text-sm text-(--ink-muted)">
        This screen is not available yet. Return to dashboard navigation.
      </p>
      <Link
        className="mt-6 rounded-2xl bg-(--action) px-5 py-3 text-sm font-semibold text-(--action-ink)"
        href="/dashboard"
      >
        Open Dashboard
      </Link>
    </main>
  );
}
