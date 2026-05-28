"use client";

import Link from "next/link";
import useSWR from "swr";

import { useAuthedApi } from "@/lib/api/auth-client";
import type { BuyerFavoritesResponse } from "@/lib/api";

export function BuyerFavoritesWidget() {
  const { get, user, isAuthLoading } = useAuthedApi();

  const { data, isLoading } = useSWR<BuyerFavoritesResponse>(
    !isAuthLoading && user ? ["buyer-favorites", user.uid] : null,
    async () => get<BuyerFavoritesResponse>("/api/escrow/buyer/favorites"),
    { revalidateOnFocus: false }
  );

  const favorites = data?.items ?? [];

  if (isLoading) {
    return (
      <section className="panel p-5 animate-pulse">
        <div className="h-4 w-32 rounded bg-slate-200"></div>
      </section>
    );
  }

  return (
    <section className="panel p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Your Favorites</h2>
          <p className="mt-1 text-xs text-(--ink-soft)">
            Save sellers to quickly find their products again
          </p>
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="mt-4 rounded-lg bg-slate-50 p-4 text-center">
          <p className="text-sm text-(--ink-muted)">
            No favorites yet. 
            <Link href="/sellers" className="ml-1 font-semibold text-(--primary) hover:underline">
              Browse sellers
            </Link>
          </p>
        </div>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {favorites.map((seller) => (
            <Link
              key={seller.seller_id}
              href={`/sellers/${seller.seller_id}`}
              className="group rounded-lg border border-(--border-soft) p-3 transition-all hover:border-(--primary) hover:shadow-md"
            >
              <h3 className="font-semibold text-foreground text-sm group-hover:text-(--primary)">
                {seller.display_name}
              </h3>
              <div className="mt-2 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <span className="text-amber-500">★</span>
                  <span className="font-semibold text-foreground">{seller.average_rating.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-1 text-(--ink-muted)">
                  <span>📞</span>
                  <span>{seller.response_rate}%</span>
                </div>
              </div>
              {seller.badge && (
                <div className="mt-2 inline-block rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                  {seller.badge}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
