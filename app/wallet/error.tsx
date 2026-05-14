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
      title="Wallet error"
      message={error.message || "The wallet view could not finish loading."}
      onRetry={reset}
    />
  );
}