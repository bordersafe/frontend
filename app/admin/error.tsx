"use client";

import { RouteErrorView } from "@/app/_components/route-fallback";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteErrorView
      title="Review queue error"
      message={error.message || "The admin queue could not finish loading."}
      onRetry={reset}
    />
  );
}