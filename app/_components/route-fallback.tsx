"use client";

import Link from "next/link";

export function RouteLoading({ title = "Loading" }: { title?: string }) {
  return (
    <main className="flex min-h-dvh items-center justify-center px-6">
      <div className="panel p-6 text-center">

        <div className="mt-4 h-1 w-48 overflow-hidden rounded-full bg-(--surface-alt)">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-(--action)" />
        </div>
      </div>
    </main>
  );
}

export function RouteErrorView({
  title = "Something went wrong",
  message = "Please try again or return to a stable section of the app.",
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <main className="flex min-h-dvh items-center justify-center px-6 text-center">
      <div className="panel max-w-md p-6">

        <h1 className="mt-3 heading-2">{title}</h1>
        <p className="mt-3 text-sm text-(--ink-muted)">{message}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {onRetry ? (
            <button className="btn-primary px-5 py-3 text-sm" onClick={onRetry} type="button">
              Try again
            </button>
          ) : null}
          <Link className="btn-secondary px-5 py-3 text-sm" href="/dashboard">
            Back to dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}