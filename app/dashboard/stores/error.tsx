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
      title="Stores error"
      message={error.message || "The store studio could not finish loading."}
      onRetry={reset}
    />
  );
}