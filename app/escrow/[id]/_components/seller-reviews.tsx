"use client";

import useSWR from "swr";
import { apiRequest } from "@/lib/api";
import type { SellerPublicProfileResponse } from "@/lib/api/types";

export function SellerReviews({ sellerId }: { sellerId: string }) {
  const { data, isLoading } = useSWR<SellerPublicProfileResponse>(
    sellerId ? `seller-reviews-${sellerId}` : null,
    async () => apiRequest<SellerPublicProfileResponse>(`/api/sellers/public/${sellerId}`),
    { revalidateOnFocus: false }
  );

  if (isLoading || !data) {
    return <div className="panel-muted px-4 py-3 text-sm">Loading reviews...</div>;
  }

  const recent = data.ratings.recent.slice(0, 3);

  if (recent.length === 0) {
    return <div className="panel-muted px-4 py-3 text-sm">No recent reviews.</div>;
  }

  return (
    <div className="panel p-4">
      <h3 className="text-sm font-semibold text-foreground">Recent buyer reviews</h3>
      <div className="mt-3 space-y-3 text-sm">
        {recent.map((r, idx) => (
          <article key={r.created_at ?? idx} className="rounded-xl border border-(--border-soft) bg-(--surface) p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="text-amber-500">{Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={i < Math.round(r.rating) ? "" : "text-slate-300"}>★</span>
                ))}</div>
                <p className="text-xs text-(--ink-soft)">{r.created_at ? new Date(r.created_at).toLocaleDateString() : "Recently"}</p>
              </div>
            </div>
            {r.comment ? <p className="mt-2 text-sm text-(--ink-muted)">{r.comment}</p> : <p className="mt-2 text-sm italic text-(--ink-soft)">No comment</p>}
          </article>
        ))}
      </div>
    </div>
  );
}
