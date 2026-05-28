"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import useSWR from "swr";
import { apiRequest } from "@/lib/api";
import { useAuthedApi } from "@/lib/api/auth-client";
import type { SellerPublicProfileResponse } from "@/lib/api/types";
import { FavoriteSellerButton } from "@/app/_components/favorite-seller-button";

type TrustedSeller = {
  seller_id: string;
  transaction_count: number;
  last_purchase_at: string;
};

export function TrustedSellersWidget({ sellerIds }: { sellerIds: string[] }) {
  const { post, user, isAuthLoading } = useAuthedApi();
  const hasTrackedViewRef = useRef(false);
  const uniqueIds = Array.from(new Set(sellerIds)).slice(0, 3);

  const { data: sellers } = useSWR(
    uniqueIds.length > 0 ? `trusted-sellers-${uniqueIds.join(",")}` : null,
    async () => {
      const results = await Promise.all(
        uniqueIds.map((id) =>
          apiRequest<SellerPublicProfileResponse>(`/api/sellers/public/${id}`)
            .then((data) => ({ success: true, data }))
            .catch(() => ({ success: false }))
        )
      );
      return results.filter((r) => r.success).map((r) => (r as any).data);
    },
    { revalidateOnFocus: false }
  );

  useEffect(() => {
    if (hasTrackedViewRef.current || isAuthLoading || !user || !sellers || sellers.length === 0) {
      return;
    }

    hasTrackedViewRef.current = true;
    Promise.all(
      sellers.map((seller) =>
        post("/api/escrow/buyer/trust-events", {
          seller_id: seller.seller_id,
          action: "viewed",
          source: "trusted_sellers_widget",
        }).catch(() => null)
      )
    ).catch(() => null);
  }, [isAuthLoading, post, sellers, user]);

  if (!sellers || sellers.length === 0) {
    return null;
  }

  const trackClick = (sellerId: string) => {
    if (isAuthLoading || !user) {
      return;
    }
    void post("/api/escrow/buyer/trust-events", {
      seller_id: sellerId,
      action: "clicked",
      source: "trusted_sellers_widget",
    }).catch(() => null);
  };

  return (
    <section className="rounded-3xl border border-(--border-soft) bg-white p-7 shadow-sm">
      <h2 className="text-lg font-semibold text-foreground">Trusted sellers</h2>
      <p className="mt-1 text-sm text-(--ink-muted)">Sellers you've successfully purchased from</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {sellers.map((seller) => (
          <div
            key={seller.seller_id}
            className="rounded-xl border border-(--border-soft) bg-background p-4 transition-all hover:shadow-md hover:border-(--primary)"
          >
            <div className="flex items-start justify-between gap-3">
              <Link
                href={`/sellers/${seller.seller_id}`}
                className="group flex-1"
                onClick={() => {
                  trackClick(seller.seller_id);
                }}
              >
                <h3 className="font-semibold text-foreground group-hover:text-(--primary)">{seller.display_name}</h3>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <span className="text-amber-500">★</span>
                    <span className="font-medium">{seller.ratings.average.toFixed(1)}</span>
                    <span className="text-(--ink-soft)">({seller.ratings.total})</span>
                  </div>
                  <span className="inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                    {seller.analytics.response_rate_percent.toFixed(0)}%
                  </span>
                </div>
              </Link>
              <FavoriteSellerButton sellerId={seller.seller_id} className="whitespace-nowrap rounded-full border border-(--border-soft) bg-white px-2 py-1 text-[11px] font-semibold text-foreground hover:border-(--primary)" />
            </div>
            {seller.badges.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {seller.badges.slice(0, 2).map((badge: string) => (
                  <span key={badge} className="rounded-full border border-(--border-soft) bg-white px-2 py-0.5 text-xs">
                    {badge === "VERIFIED"
                      ? "✓ Verified"
                      : badge === "HIGH_RATING"
                        ? "⭐ Top Rated"
                        : badge === "FAST_PAYOUT"
                          ? "⚡ Fast"
                          : "↺ Responsive"}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
