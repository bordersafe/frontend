"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { apiClient, normalizeApiError } from "@/lib/api";
import type { UiError } from "@/lib/api";

type LookupResponse = {
  id: string;
};

export default function FeedbackLookupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<UiError | null>(null);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 12000);

    const run = async () => {
      const reference = searchParams.get("reference")?.trim() ?? "";
      const transactionRef = searchParams.get("transaction_ref")?.trim() ?? "";
      const lookupRef = transactionRef || reference;

      if (!lookupRef) {
        if (!cancelled) {
          setIsLoading(false);
          setError({
            kind: "VALIDATION",
            title: "Missing reference",
            message: "Expected a reference in the URL, for example ?reference=BS_xxx or ?transaction_ref=BS_xxx.",
            retryable: false,
            correlationId: null,
            status: 400,
          });
        }
        return;
      }

      try {
        const query = transactionRef
          ? `transaction_ref=${encodeURIComponent(transactionRef)}`
          : `reference=${encodeURIComponent(reference)}`;
        const response = await apiClient.get<LookupResponse>(
          `/api/escrow/public/lookup?${query}`,
          { signal: controller.signal }
        );
        if (!cancelled && response?.id) {
          router.replace(`/feedback/${response.id}`);
          return;
        }
      } catch (err) {
        if (!cancelled) {
          const normalized = normalizeApiError(err);
          if (controller.signal.aborted) {
            setError({
              kind: "NETWORK",
              title: "Lookup timeout",
              message:
                "Timed out while locating this escrow. Confirm NEXT_PUBLIC_API_BASE_URL points to a reachable backend (use ngrok URL for external/mobile redirects).",
              retryable: true,
              correlationId: null,
              status: 504,
            });
          } else {
            setError(normalized);
          }
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [router, searchParams]);

  return (
    <main className="flex min-h-full flex-col gap-6 px-4 py-6 sm:px-8 lg:px-10">
      <section className="panel p-6">
        <h1 className="heading-1 mt-2">Resolving payment feedback link</h1>
        <p className="mt-2 text-sm text-(--ink-muted)">
          {isLoading
            ? "Please wait while we locate the escrow from this payment reference..."
            : error?.message ?? "Unable to resolve this payment reference."}
        </p>
      </section>
    </main>
  );
}
