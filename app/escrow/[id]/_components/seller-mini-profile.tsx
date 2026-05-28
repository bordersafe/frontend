"use client";

import useSWR from "swr";
import { apiRequest } from "@/lib/api";
import type { SellerPublicProfileResponse } from "@/lib/api/types";

export function SellerMiniProfile({ sellerId }: { sellerId: string }) {
  const { data, isLoading } = useSWR<SellerPublicProfileResponse>(
    sellerId ? `seller-mini-${sellerId}` : null,
    async () => apiRequest<SellerPublicProfileResponse>(`/api/sellers/public/${sellerId}`),
    { revalidateOnFocus: false }
  );

  if (isLoading || !data) {
    return <div className="panel-muted px-4 py-3 text-sm">Loading seller info...</div>;
  }

  return (
    <div className="panel-muted px-4 py-3 text-sm">
      <div className="flex items-center justify-between">
        <div>

          <p className="mt-1 font-semibold text-foreground">{data.display_name}</p>
          <p className="text-xs text-(--ink-muted)">{data.ratings.total} ratings • {data.analytics.response_rate_percent.toFixed(1)}% response</p>
        </div>
        <div className="flex gap-2">
          {data.badges.slice(0,3).map((b) => (
            <span key={b} className="rounded-full border px-2 py-1 text-xs bg-white">{b}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
