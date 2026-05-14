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
      title="App error"
      message={error.message || "The app hit a problem while rendering this view."}
      onRetry={reset}
    />
  );
}