"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import useSWR from "swr";

import { apiRequest } from "@/lib/api";
import type { SellerBadge, SellerPublicProfileResponse } from "@/lib/api/types";
import { FavoriteSellerButton } from "@/app/_components/favorite-seller-button";

const BADGE_META: Record<SellerBadge, { label: string; icon: string; cls: string }> = {
  VERIFIED: {
    label: "Verified",
    icon: "✓",
    cls: "status-chip status-disbursed",
  },
  FAST_PAYOUT: {
    label: "Fast Payout",
    icon: "⚡",
    cls: "status-chip status-funds-locked",
  },
  HIGH_RATING: {
    label: "High Rating",
    icon: "★",
    cls: "status-chip status-awaiting-payment",
  },
  RESPONSIVE_SELLER: {
    label: "Responsive",
    icon: "↺",
    cls: "status-chip status-admin-finalization",
  },
};

function renderStars(rating: number) {
  return Array.from({ length: 5 }).map((_, index) => (
    <span
      key={index}
      className={index < Math.round(rating) ? "text-amber-400" : "text-(--border-soft)"}
    >
      ★
    </span>
  ));
}

function formatPeriod(period: string) {
  const [year, month] = period.split("-");
  const monthNum = Number(month);
  if (!year || !Number.isFinite(monthNum)) return period;
  const date = new Date(Date.UTC(Number(year), monthNum - 1, 1));
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

function trendLabel(direction: "UP" | "DOWN" | "FLAT") {
  if (direction === "UP") return { label: "Improving ↑", cls: "text-(--success)" };
  if (direction === "DOWN") return { label: "Declining ↓", cls: "text-(--danger)" };
  return { label: "Stable →", cls: "text-(--ink-muted)" };
}

function trendHeightPct(averageRating: number): string {
  return `${Math.round((Math.min(5, Math.max(0, averageRating)) / 5) * 80)}px`;
}

function SellerProfileSkeleton() {
  return (
    <main className="flex min-h-full flex-col gap-6 px-4 py-6 sm:px-8 lg:px-10">
      <div className="panel p-6 space-y-4">
        <div className="skeleton h-4 w-32" />
        <div className="skeleton h-9 w-64" />
        <div className="skeleton h-4 w-40" />
        <div className="flex gap-2">
          <div className="skeleton h-6 w-20 rounded-full" />
          <div className="skeleton h-6 w-24 rounded-full" />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="panel p-6 space-y-4">
          <div className="skeleton h-6 w-40" />
          <div className="skeleton h-32 w-full rounded-2xl" />
          <div className="skeleton h-48 w-full rounded-2xl" />
        </div>
        <div className="space-y-4">
          <div className="panel p-6 space-y-3">
            <div className="skeleton h-5 w-32" />
            <div className="skeleton h-16 w-full rounded-2xl" />
            <div className="skeleton h-16 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </main>
  );
}

export default function PublicSellerProfilePage() {
  const params = useParams<{ id: string }>();
  const sellerId = params?.id;

  const { data, isLoading, error } = useSWR<SellerPublicProfileResponse>(
    sellerId ? `seller-public-${sellerId}` : null,
    async () => apiRequest<SellerPublicProfileResponse>(`/api/sellers/public/${sellerId}`),
    { revalidateOnFocus: false }
  );

  if (isLoading) return <SellerProfileSkeleton />;

  if (error || !data) {
    return (
      <main className="flex min-h-full flex-col gap-6 px-4 py-6 sm:px-8 lg:px-10">
        <section className="panel-danger p-6 rounded-2xl reveal-up">
          <h1 className="font-bold text-(--danger) text-base mb-2">Seller profile unavailable</h1>
          <p className="text-sm text-(--ink-muted)">
            This seller may not exist or their public profile is not ready yet.
          </p>
          <Link href="/" className="mt-4 inline-block text-sm font-semibold text-(--primary) hover:underline">
            Return home →
          </Link>
        </section>
      </main>
    );
  }

  const trend = trendLabel(data.analytics.rating_trend_direction);

  return (
    <main className="flex min-h-full flex-col gap-6 px-4 py-6 sm:px-8 lg:px-10">
      {/* Hero header */}
      <header className="panel reveal-up relative overflow-hidden p-7">
        <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-(--action)/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-(--success)/10 blur-3xl pointer-events-none" />

        <div className="relative flex flex-wrap items-start justify-between gap-5">
          <div>
            <h1 className="heading-1">{data.display_name}</h1>
            <p className="mt-1 text-sm text-(--ink-muted)">
              Member since{" "}
              {data.joined_at
                ? new Date(data.joined_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
                : "recently"}
            </p>

            {/* Badges */}
            <div className="mt-4 flex flex-wrap gap-2">
              {data.badges.length === 0 ? (
                <span className="chip text-xs">No badges yet</span>
              ) : (
                data.badges.map((badge) => {
                  const meta = BADGE_META[badge];
                  return (
                    <span key={badge} className={`${meta.cls} text-xs`}>
                      <span className="mr-1">{meta.icon}</span>
                      {meta.label}
                    </span>
                  );
                })
              )}
            </div>
          </div>

          {/* Rating summary + favorite */}
          <div className="flex flex-col items-end gap-3">
            <div className="panel-muted rounded-2xl px-5 py-3 text-center">
              <p className="text-3xl font-black text-foreground">{data.ratings.average.toFixed(1)}</p>
              <div className="flex justify-center gap-0.5 text-base mt-1">
                {renderStars(data.ratings.average)}
              </div>
              <p className="text-xs text-(--ink-soft) mt-1">{data.ratings.total} ratings</p>
            </div>
            <FavoriteSellerButton sellerId={data.seller_id} />
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr] reveal-up delay-80">
        {/* Left — Ratings & Reviews */}
        <div className="space-y-6">
          <section className="panel p-6">
            <div className="flex items-center justify-between mb-5">
              <span className={`text-xs font-bold ${trend.cls}`}>{trend.label}</span>
            </div>

            {/* Bar chart */}
            <div className="flex items-end gap-2 h-24 mb-3">
              {data.analytics.rating_trend.map((item) => (
                <div key={item.period} className="flex flex-col items-center gap-1.5 flex-1">
                  <div className="w-full flex items-end justify-center rounded-t-lg bg-(--border-soft)/50 h-20 px-1">
                    <div
                      className="w-full rounded-t-md bg-linear-to-t from-(--primary) to-(--success) transition-all"
                      style={{ height: trendHeightPct(item.average_rating) }}
                      title={`${item.average_rating.toFixed(1)} avg · ${item.total_ratings} rating(s)`}
                    />
                  </div>
                  <span className="text-[9px] font-medium text-(--ink-soft) whitespace-nowrap">
                    {formatPeriod(item.period)}
                  </span>
                </div>
              ))}
            </div>

            {/* Recent reviews */}
            <div className="space-y-3">
              {data.ratings.recent.length === 0 ? (
                <div className="py-8 flex flex-col items-center gap-2 text-center border border-dashed border-(--border-soft) rounded-2xl">
                  <span className="text-3xl">💬</span>
                  <p className="text-sm text-(--ink-muted)">No buyer reviews posted yet.</p>
                </div>
              ) : (
                data.ratings.recent.map((item, index) => (
                  <article
                    key={`${item.created_at ?? index}`}
                    className="panel-muted rounded-2xl px-4 py-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-0.5 text-sm">{renderStars(item.rating)}</div>
                      <p className="text-xs text-(--ink-soft)">
                        {item.created_at
                          ? new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                          : "Recently"}
                      </p>
                    </div>
                    {item.comment ? (
                      <p className="text-sm text-(--ink-muted) leading-relaxed">{item.comment}</p>
                    ) : (
                      <p className="text-sm italic text-(--ink-soft)">No written comment.</p>
                    )}
                  </article>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Right — Analytics & Compliance */}
        <aside className="space-y-5">
          <section className="panel p-6">
            <div className="space-y-3">
              <div className="panel-muted rounded-2xl px-4 py-3">
                <p className="mt-1.5 text-2xl font-black text-foreground">
                  {data.analytics.response_rate_percent.toFixed(1)}%
                </p>
                <p className="text-xs text-(--ink-muted) mt-0.5">
                  {data.analytics.responded_disputes} of {data.analytics.total_disputes} disputes responded
                </p>
              </div>
              <div className="panel-muted rounded-2xl px-4 py-3">
                <p className={`mt-1.5 font-bold text-sm ${trend.cls}`}>
                  {trend.label}
                </p>
              </div>
            </div>
          </section>

          <section className="panel p-6">
            <div className="space-y-3">
              <div className="panel-muted rounded-2xl px-4 py-3 flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">KYC status</p>
                <span className={`text-xs font-bold ${
                  data.compliance.kyc_status === "VERIFIED"
                    ? "text-(--success)"
                    : data.compliance.kyc_status === "PENDING"
                    ? "text-(--warning)"
                    : data.compliance.kyc_status === "REJECTED"
                    ? "text-(--danger)"
                    : "text-(--ink-muted)"
                }`}>
                  {data.compliance.kyc_status.replace("_", " ")}
                </span>
              </div>
              <div className="panel-muted rounded-2xl px-4 py-3 flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">Compliance</p>
                <span className="text-xs font-bold text-(--ink-muted)">
                  {data.compliance.compliance_status.replace("_", " ")}
                </span>
              </div>
              <div className="panel-muted rounded-2xl px-4 py-3">
                <p className="mt-1.5 text-sm font-semibold text-foreground">
                  {data.compliance.verified_at
                    ? new Date(data.compliance.verified_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "Not verified yet"}
                </p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
