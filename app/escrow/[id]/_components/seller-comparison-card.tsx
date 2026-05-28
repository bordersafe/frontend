"use client";

import useSWR from "swr";
import { apiRequest } from "@/lib/api";
import type { SellerPublicProfileResponse } from "@/lib/api/types";

export function SellerComparisonCard({ sellerId }: { sellerId: string }) {
  const { data, isLoading } = useSWR<SellerPublicProfileResponse>(
    sellerId ? `seller-comparison-${sellerId}` : null,
    async () => apiRequest<SellerPublicProfileResponse>(`/api/sellers/public/${sellerId}`),
    { revalidateOnFocus: false }
  );

  if (isLoading || !data) {
    return null;
  }

  // Helper to determine tier badge based on metrics
  const getResponseTier = (rate: number) => {
    if (rate >= 90) return { label: "Top Responder", tone: "bg-emerald-100 text-emerald-800" };
    if (rate >= 75) return { label: "Responsive", tone: "bg-sky-100 text-sky-800" };
    if (rate >= 50) return { label: "Moderate", tone: "bg-amber-100 text-amber-800" };
    return { label: "Limited Response", tone: "bg-slate-100 text-slate-800" };
  };

  const getRatingTier = (rating: number) => {
    if (rating >= 4.8) return { label: "Exceptional", tone: "bg-emerald-100 text-emerald-800" };
    if (rating >= 4.5) return { label: "Excellent", tone: "bg-emerald-100 text-emerald-800" };
    if (rating >= 4.0) return { label: "Very Good", tone: "bg-sky-100 text-sky-800" };
    if (rating >= 3.5) return { label: "Good", tone: "bg-amber-100 text-amber-800" };
    return { label: "Fair", tone: "bg-slate-100 text-slate-800" };
  };

  const getTotalMetric = (metric: number) => {
    if (metric >= 75) return "Excellent";
    if (metric >= 50) return "Good";
    return "Fair";
  };

  const responseTier = getResponseTier(data.analytics.response_rate_percent);
  const ratingTier = getRatingTier(data.ratings.average);

  return (
    <section className="panel p-5">
      <h2 className="text-sm font-semibold text-foreground">Seller trust profile</h2>
      <p className="mt-1 text-xs text-(--ink-soft)">How this seller compares on key trust dimensions</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-(--border-soft) bg-(--surface) p-4">
          <div className="flex items-start justify-between">
            <div>

              <p className="mt-2 text-lg font-semibold text-foreground">
                {data.analytics.response_rate_percent.toFixed(1)}%
              </p>
              <p className="mt-1 text-xs text-(--ink-muted)">
                {data.analytics.responded_disputes} of {data.analytics.total_disputes} disputes
              </p>
            </div>
            <span className={`rounded-full px-2 py-1 text-xs font-semibold ${responseTier.tone}`}>
              {responseTier.label}
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-(--border-soft) bg-(--surface) p-4">
          <div className="flex items-start justify-between">
            <div>

              <p className="mt-2 text-lg font-semibold text-foreground">
                {data.ratings.average.toFixed(1)} / 5.0
              </p>
              <p className="mt-1 text-xs text-(--ink-muted)">
                {data.ratings.total} buyer rating{data.ratings.total !== 1 ? "s" : ""}
              </p>
            </div>
            <span className={`rounded-full px-2 py-1 text-xs font-semibold ${ratingTier.tone}`}>
              {ratingTier.label}
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-(--border-soft) bg-(--surface) p-4">

          <p className="mt-2 font-semibold text-foreground">
            {data.compliance.compliance_status.replace(/_/g, " ")}
          </p>
          <p className="mt-1 text-xs text-(--ink-muted)">
            KYC: {data.compliance.kyc_status.replace(/_/g, " ")}
          </p>
        </div>

        <div className="rounded-lg border border-(--border-soft) bg-(--surface) p-4">

          <p className="mt-2 font-semibold text-foreground">
            {data.joined_at ? new Date(data.joined_at).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "Recently"}
          </p>
          <p className="mt-1 text-xs text-(--ink-muted)">Active seller</p>
        </div>
      </div>

      <div className="mt-3 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-800">
        <p className="font-medium">💡 What this means</p>
        <p className="mt-1 text-xs">
          This seller is{" "}
          <span className="font-semibold">{responseTier.label.toLowerCase()}</span> with{" "}
          <span className="font-semibold">{ratingTier.label.toLowerCase()}</span> ratings and verified{" "}
          <span className="font-semibold">{data.compliance.compliance_status.toLowerCase()}</span> compliance status.
          {data.analytics.response_rate_percent >= 90 && " They consistently respond to disputes and take buyer concerns seriously."}
          {data.ratings.average >= 4.5 && " Buyers consistently rate them highly for quality and service."}
        </p>
      </div>
    </section>
  );
}
