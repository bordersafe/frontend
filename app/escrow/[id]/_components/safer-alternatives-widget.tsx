"use client";

import Link from "next/link";
import useSWR from "swr";

import { apiRequest } from "@/lib/api";
import type { SellerRecommendationsResponse } from "@/lib/api";

export function SaferAlternativesWidget({ currentSellerId }: { currentSellerId?: string | null }) {
  const { data, isLoading } = useSWR<SellerRecommendationsResponse>(
    currentSellerId ? `seller-recommendations-${currentSellerId}` : null,
    async () =>
      apiRequest<SellerRecommendationsResponse>(
        `/api/sellers/recommendations?current_seller_id=${encodeURIComponent(currentSellerId ?? "")}&limit=3`
      ),
    { revalidateOnFocus: false }
  );

  const alternatives = data?.items ?? [];

  if (!isLoading && alternatives.length === 0) {
    return null;
  }

  return (
    <section className="panel relative overflow-hidden bg-linear-to-br from-amber-50 to-orange-50 p-5 border-l-4 border-l-amber-400">
      <div className="absolute inset-0 -right-20 -top-20 h-40 w-40 rounded-full bg-amber-100 opacity-30 blur-3xl" />
      <div className="relative">
        <div className="flex items-start gap-2">
          <span className="text-xl">🔍</span>
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-foreground">Explore safer alternatives</h2>
            <p className="mt-1 text-xs text-(--ink-muted)">Consider these highly-rated sellers for similar products</p>
          </div>
        </div>

        <div className="mt-4 grid gap-3">
          {isLoading && alternatives.length === 0 && (
            <div className="rounded-lg border border-amber-200 bg-white px-4 py-3 text-sm text-(--ink-muted)">
              Loading safer alternatives...
            </div>
          )}

          {alternatives.map((seller) => (
            <Link
              key={seller.seller_id}
              href={`/sellers/${seller.seller_id}`}
              className="group rounded-lg border border-amber-200 bg-white px-4 py-3 transition-all hover:shadow-md hover:border-amber-400"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground group-hover:text-amber-700">{seller.display_name}</h3>
                  <p className="mt-1 text-xs text-(--ink-soft)">{seller.reason}</p>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-amber-500">★</span>
                  <span className="font-medium">{seller.rating_average.toFixed(1)}</span>
                  <span className="text-(--ink-soft)">({seller.rating_total})</span>
                </div>
                <span className="inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                  {seller.response_rate_percent.toFixed(0)}% response
                </span>
              </div>
            </Link>
          ))}
        </div>

        <p className="mt-3 text-xs text-(--ink-soft)">
          💡 These sellers have high trust scores and positive buyer feedback. Compare their offerings and pricing.
        </p>
      </div>
    </section>
  );
}
