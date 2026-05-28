"use client";

import useSWR from "swr";
import { useAuthedApi } from "@/lib/api/auth-client";
import type { BuyerRetentionMetricsResponse } from "@/lib/api";

const TIER_COLORS = {
  bronze: { bg: "bg-amber-50", border: "border-amber-200", badge: "bg-amber-100 text-amber-800" },
  silver: { bg: "bg-slate-50", border: "border-slate-200", badge: "bg-slate-100 text-slate-800" },
  gold: { bg: "bg-yellow-50", border: "border-yellow-200", badge: "bg-yellow-100 text-yellow-800" },
  platinum: { bg: "bg-blue-50", border: "border-blue-200", badge: "bg-blue-100 text-blue-800" },
};

export function BuyerAnalyticsDashboard() {
  const { get, user, isAuthLoading } = useAuthedApi();

  const fallbackAnalytics: BuyerRetentionMetricsResponse = {
    total_purchases: 0,
    total_spent: 0,
    average_order_value: 0,
    disputes_opened: 0,
    dispute_win_rate: 100,
    refunds_received: 0,
    trusted_sellers_count: 0,
    account_age_days: 0,
    first_purchase_date: null,
    last_purchase_date: null,
    buyer_tier: "bronze",
    completion_rate: 0,
    safety_score: 60,
    repeat_purchase_rate: 0,
    retention: {
      day_30: 0,
      day_60: 0,
      day_90: 0,
    },
    dispute_resolution_time_hours_avg: null,
    refund_turnaround_time_hours_avg: null,
    dispute_reopen_rate: 0,
    csat_score: null,
    review_completion_rate: 0,
    buyer_trust_click_through_rate: 0,
    seller_quality_distribution: {
      high: 0,
      medium: 0,
      low: 0,
    },
    ltv_cac_ratio: null,
  };

  const { data: analytics } = useSWR<BuyerRetentionMetricsResponse>(
    !isAuthLoading && user ? ["buyer-analytics", user.uid] : null,
    async () => get<BuyerRetentionMetricsResponse>("/api/escrow/buyer/retention-metrics"),
    { revalidateOnFocus: false }
  );

  const data = analytics ?? fallbackAnalytics;
  const tierColors = TIER_COLORS[data.buyer_tier];

  return (
    <section className="space-y-6">
      {/* Buyer Tier Card */}
      <div className={`panel p-6 border ${tierColors.border}`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Your Buyer Profile</h2>
            <p className="mt-1 text-sm text-(--ink-soft)">
              You're a trusted buyer on VendOpay
            </p>
          </div>
          <div className={`rounded-full px-4 py-2 font-semibold text-sm ${tierColors.badge}`}>
            {data.buyer_tier.toUpperCase()}
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-white/50 p-3">

            <p className="mt-2 font-semibold text-foreground">{data.account_age_days} days</p>
          </div>
          <div className="rounded-lg bg-white/50 p-3">

            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className={`h-full bg-emerald-500 transition-all ${data.safety_score >= 90 ? "w-[90%]" : data.safety_score >= 75 ? "w-[75%]" : data.safety_score >= 50 ? "w-[50%]" : "w-[25%]"}`}
                />
              </div>
              <span className="font-semibold text-foreground">{data.safety_score}/100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="panel p-5">

          <p className="mt-3 text-3xl font-bold text-foreground">{data.total_purchases}</p>
          <p className="mt-2 text-xs text-(--ink-muted)">Orders completed</p>
        </div>

        <div className="panel p-5">

          <p className="mt-3 text-3xl font-bold text-foreground">₦{(data.total_spent / 1000).toFixed(0)}K</p>
          <p className="mt-2 text-xs text-(--ink-muted)">Average ₦{data.average_order_value.toLocaleString()}</p>
        </div>

        <div className="panel p-5">

          <p className="mt-3 text-3xl font-bold text-foreground">{data.completion_rate}%</p>
          <p className="mt-2 text-xs text-(--ink-muted)">Orders completed successfully</p>
        </div>

        <div className="panel p-5">

          <p className="mt-3 text-3xl font-bold text-foreground">{data.trusted_sellers_count}</p>
          <p className="mt-2 text-xs text-(--ink-muted)">Repeat sellers ({data.repeat_purchase_rate}% repeat rate)</p>
        </div>
      </div>

      {/* Disputes & Refunds */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="panel p-5 border-l-4 border-l-blue-500">
          <p className="text-sm font-semibold text-foreground">Dispute History</p>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-(--ink-muted)">Disputes opened</span>
              <span className="font-semibold text-foreground">{data.disputes_opened}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-(--ink-muted)">Win rate</span>
              <span className="font-semibold text-emerald-600">{data.dispute_win_rate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-(--ink-muted)">Refunds issued</span>
              <span className="font-semibold text-foreground">₦{data.refunds_received.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="panel p-5 border-l-4 border-l-emerald-500">
          <p className="text-sm font-semibold text-foreground">Activity Timeline</p>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-(--ink-muted)">Last purchase</span>
              <span className="font-semibold text-foreground">
                {data.last_purchase_date
                  ? new Date(data.last_purchase_date).toLocaleDateString()
                  : "No purchases"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-(--ink-muted)">Member since</span>
              <span className="font-semibold text-foreground">
                {data.first_purchase_date
                  ? new Date(data.first_purchase_date).toLocaleDateString()
                  : "No purchases"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="panel p-5 border-l-4 border-l-indigo-500">
        <p className="text-sm font-semibold text-foreground">Retention Snapshot</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-indigo-50 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-indigo-700">30 days</p>
            <p className="mt-2 text-xl font-semibold text-indigo-900">{data.retention.day_30}%</p>
          </div>
          <div className="rounded-lg bg-indigo-50 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-indigo-700">60 days</p>
            <p className="mt-2 text-xl font-semibold text-indigo-900">{data.retention.day_60}%</p>
          </div>
          <div className="rounded-lg bg-indigo-50 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-indigo-700">90 days</p>
            <p className="mt-2 text-xl font-semibold text-indigo-900">{data.retention.day_90}%</p>
          </div>
        </div>
        <p className="mt-3 text-xs text-(--ink-muted)">
          LTV/CAC ratio: {data.ltv_cac_ratio === null ? "Pending attribution data" : data.ltv_cac_ratio.toFixed(2)}
        </p>
      </div>

      <div className="panel p-5 border-l-4 border-l-cyan-500">
        <p className="text-sm font-semibold text-foreground">Protection & Trust KPIs</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-cyan-50 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-700">Dispute Resolution</p>
            <p className="mt-2 text-lg font-semibold text-cyan-900">
              {data.dispute_resolution_time_hours_avg === null
                ? "N/A"
                : `${data.dispute_resolution_time_hours_avg.toFixed(1)}h`}
            </p>
          </div>
          <div className="rounded-lg bg-cyan-50 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-700">Refund Turnaround</p>
            <p className="mt-2 text-lg font-semibold text-cyan-900">
              {data.refund_turnaround_time_hours_avg === null
                ? "N/A"
                : `${data.refund_turnaround_time_hours_avg.toFixed(1)}h`}
            </p>
          </div>
          <div className="rounded-lg bg-cyan-50 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-700">Dispute Reopen</p>
            <p className="mt-2 text-lg font-semibold text-cyan-900">{data.dispute_reopen_rate}%</p>
          </div>
          <div className="rounded-lg bg-cyan-50 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-700">CSAT Score</p>
            <p className="mt-2 text-lg font-semibold text-cyan-900">
              {data.csat_score === null ? "N/A" : `${data.csat_score.toFixed(1)}/100`}
            </p>
          </div>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-slate-50 p-3 text-xs text-(--ink-muted)">
            Review completion: <span className="font-semibold text-foreground">{data.review_completion_rate}%</span>
          </div>
          <div className="rounded-lg bg-slate-50 p-3 text-xs text-(--ink-muted)">
            Trust click-through: <span className="font-semibold text-foreground">{data.buyer_trust_click_through_rate}%</span>
          </div>
        </div>
        <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-(--ink-muted)">
          Seller quality distribution: <span className="font-semibold text-foreground">High {data.seller_quality_distribution.high}</span>,{" "}
          <span className="font-semibold text-foreground">Medium {data.seller_quality_distribution.medium}</span>,{" "}
          <span className="font-semibold text-foreground">Low {data.seller_quality_distribution.low}</span>
        </div>
      </div>

      {/* Tier Benefits */}
      <div className="panel p-6 bg-linear-to-br from-emerald-50 to-teal-50 border border-emerald-200">
        <h3 className="font-semibold text-foreground">Your {data.buyer_tier.toUpperCase()} Benefits</h3>
        <p className="mt-1 text-sm text-(--ink-soft)">Exclusive perks for trusted buyers</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {data.buyer_tier === "gold" && (
            <>
              <div className="flex gap-3 rounded-lg bg-white/60 p-3">
                <span className="text-lg">⚡</span>
                <div>
                  <p className="text-sm font-semibold text-foreground">Fast Refunds</p>
                  <p className="text-xs text-(--ink-muted)">Same-day processing</p>
                </div>
              </div>
              <div className="flex gap-3 rounded-lg bg-white/60 p-3">
                <span className="text-lg">🛡️</span>
                <div>
                  <p className="text-sm font-semibold text-foreground">Priority Support</p>
                  <p className="text-xs text-(--ink-muted)">24/7 support access</p>
                </div>
              </div>
              <div className="flex gap-3 rounded-lg bg-white/60 p-3">
                <span className="text-lg">💰</span>
                <div>
                  <p className="text-sm font-semibold text-foreground">Loyalty Bonus</p>
                  <p className="text-xs text-(--ink-muted)">Cashback on orders</p>
                </div>
              </div>
              <div className="flex gap-3 rounded-lg bg-white/60 p-3">
                <span className="text-lg">⭐</span>
                <div>
                  <p className="text-sm font-semibold text-foreground">Badge Status</p>
                  <p className="text-xs text-(--ink-muted)">Verified buyer badge</p>
                </div>
              </div>
            </>
          )}

          {(data.buyer_tier === "bronze" || data.buyer_tier === "silver") && (
            <div className="col-span-2 rounded-lg bg-white/60 p-4 text-center">
              <p className="text-sm text-(--ink-muted)">
                Continue purchasing to unlock benefits and upgrade your tier!
              </p>
              <p className="mt-2 text-xs font-semibold text-(--primary)">
                {data.total_purchases < 5
                  ? `${5 - data.total_purchases} more purchases to reach Silver tier`
                  : `${10 - data.total_purchases} more purchases to reach Gold tier`}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Recommendations */}
      <div className="panel p-6 bg-linear-to-br from-blue-50 to-cyan-50 border border-blue-200">
        <h3 className="font-semibold text-foreground">Personalized Recommendations</h3>
        <div className="mt-4 space-y-3">
          <div className="flex gap-3 rounded-lg bg-white/60 p-3">
            <span>💡</span>
            <div>
              <p className="text-sm font-semibold text-foreground">Explore new categories</p>
              <p className="text-xs text-(--ink-muted)">Based on your purchase history</p>
            </div>
          </div>
          <div className="flex gap-3 rounded-lg bg-white/60 p-3">
            <span>🔔</span>
            <div>
              <p className="text-sm font-semibold text-foreground">Follow your favorite sellers</p>
              <p className="text-xs text-(--ink-muted)">Get notified of new products</p>
            </div>
          </div>
          <div className="flex gap-3 rounded-lg bg-white/60 p-3">
            <span>🎯</span>
            <div>
              <p className="text-sm font-semibold text-foreground">Join loyalty program</p>
              <p className="text-xs text-(--ink-muted)">Earn points on every purchase</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
