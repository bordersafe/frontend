"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";

import { normalizeApiError } from "@/lib/api";
import { useAuthedApi } from "@/lib/api/auth-client";
import type { BuyerOrderSummaryResponse, EscrowDetail, UiError } from "@/lib/api";
import { useEscrowNotifications } from "@/lib/useEscrowNotifications";
import { formatCurrency, formatRelativeTime } from "@/lib/format";
import { TrustedSellersWidget } from "./_components/trusted-sellers-widget";
import { ProtectionPerksWidget } from "./_components/protection-perks-widget";
import { ReactivationCampaignWidget } from "./_components/reactivation-campaign-widget";
import { BuyerOnboardingGuide } from "./_components/buyer-onboarding-guide";
import { BuyerHelpWidget } from "./_components/buyer-help-widget";
import { BuyerAnalyticsDashboard } from "./_components/buyer-analytics-dashboard";
import { BuyerLoyaltyTracker } from "./_components/buyer-loyalty-tracker";
import { BuyerFavoritesWidget } from "./_components/buyer-favorites-widget";

type StatusMeta = {
  label: string;
  tone: string;
  nextAction: string;
  milestone: string;
};

const STATUS_META: Record<string, StatusMeta> = {
  AWAITING_PAYMENT: {
    label: "Awaiting payment",
    tone: "bg-(--warning)/10 text-(--warning)",
    nextAction: "Complete payment to lock funds in escrow.",
    milestone: "Payment pending",
  },
  FUNDS_LOCKED: {
    label: "Funds locked",
    tone: "bg-(--info)/10 text-(--info)",
    nextAction: "Wait for shipment and watch for delivery updates.",
    milestone: "Escrow secured",
  },
  DELIVERED_AWAITING_BUYER_CONFIRMATION: {
    label: "Awaiting confirmation",
    tone: "bg-(--warning)/10 text-(--warning)",
    nextAction: "Inspect the goods and confirm or dispute delivery.",
    milestone: "Delivery confirmed",
  },
  AWAITING_ADMIN_FINALIZATION: {
    label: "Under review",
    tone: "bg-(--primary)/10 text-(--primary)",
    nextAction: "Check back for the admin decision and final status.",
    milestone: "Review in progress",
  },
  DISBURSED: {
    label: "Paid out",
    tone: "bg-(--success)/10 text-(--success)",
    nextAction: "Order complete. Keep the receipt for your records.",
    milestone: "Payout released",
  },
  REFUNDED: {
    label: "Refunded",
    tone: "bg-(--warning)/10 text-(--warning)",
    nextAction: "Refund completed. Review any related dispute details.",
    milestone: "Refund issued",
  },
};

function getStatusMeta(status: string): StatusMeta {
  return (
    STATUS_META[status] ?? {
      label: status.replaceAll("_", " "),
      tone: "bg-(--ink-soft)/10 text-(--ink-soft)",
      nextAction: "Review this order for the latest update.",
      milestone: "Status update",
    }
  );
}

function getDeliveryProgress(status: string): number {
  if (status === "AWAITING_PAYMENT") return 20;
  if (status === "FUNDS_LOCKED") return 45;
  if (status === "DELIVERED_AWAITING_BUYER_CONFIRMATION") return 70;
  if (status === "AWAITING_ADMIN_FINALIZATION") return 85;
  if (status === "DISBURSED" || status === "REFUNDED") return 100;
  return 30;
}

function getProgressWidthClass(progress: number): string {
  if (progress >= 100) return "w-full";
  if (progress >= 85) return "w-[85%]";
  if (progress >= 70) return "w-[70%]";
  if (progress >= 45) return "w-[45%]";
  return "w-[20%]";
}

function OrderCard({ order }: { order: EscrowDetail }) {
  const statusMeta = getStatusMeta(order.status);
  const progress = getDeliveryProgress(order.status);
  const progressWidthClass = getProgressWidthClass(progress);

  // Wire up notifications for status changes
  useEscrowNotifications(order);

  return (
    <article className="panel lift-hover p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">{order.transaction_ref}</h2>
          <p className="text-sm text-(--ink-muted)">
            {formatCurrency(order.amount, order.currency)}
            {order.description ? ` · ${order.description}` : ""}
          </p>
        </div>
        <span className={`chip ${statusMeta.tone}`}>{statusMeta.label}</span>
      </div>

      <div className="mt-4 space-y-3">
        <div className="h-2 overflow-hidden rounded-full bg-(--border)">
          <div
          className={`h-full rounded-full bg-linear-to-r from-(--primary) to-(--success) transition-[width] duration-500 ${progressWidthClass}`}
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-(--ink-soft)">
          <span>{statusMeta.milestone}</span>
          <span>Updated {formatRelativeTime(order.updated_at ?? order.created_at)}</span>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="panel-muted px-4 py-3">
          <p className="mt-2 text-sm text-foreground">{statusMeta.nextAction}</p>
        </div>
        <div className="panel-muted px-4 py-3">
          <p className="mt-2 text-sm text-foreground">
            {order.status === "DISBURSED" || order.status === "REFUNDED"
              ? "Closed"
              : "Held in escrow"}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Link className="btn-primary px-4 py-2 text-xs" href={`/escrow/${order.id}`}>
          View order
        </Link>
        {/* Show dispute hint only when the buyer can act */}
        {(order.status === "DELIVERED_AWAITING_BUYER_CONFIRMATION" ||
          order.status === "FUNDS_LOCKED") && (
          <span className="text-xs text-(--ink-soft)">
            You can open a dispute from the order detail page.
          </span>
        )}
      </div>
    </article>
  );
}

export default function BuyerCenterPage() {
  const router = useRouter();
  const { user, profile, isAuthLoading, get } = useAuthedApi();
  const roles = profile?.roles ?? [];
  const {
    data,
    error: fetchError,
    isLoading,
    mutate,
  } = useSWR<BuyerOrderSummaryResponse>(
    !isAuthLoading && user ? ["buyer-order-summary", user.uid] : null,
    async () => get<BuyerOrderSummaryResponse>("/api/escrow/buyer/summary"),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 15000,
      shouldRetryOnError: false,
    },
  );

  const error = fetchError ? normalizeApiError(fetchError) : null;
  const activeOrders = data?.active ?? [];
  const recentOrders = data?.recent ?? [];
  const totalOrders = activeOrders.length + recentOrders.length;

  useEffect(() => {
    if (isAuthLoading || !profile) {
      return;
    }

    if (roles.includes("admin") || roles.includes("super_admin") || roles.includes("hitl")) {
      router.replace("/admin");
      return;
    }

    if (roles.includes("vendor")) {
      router.replace("/dashboard");
      return;
    }

    if (!roles.includes("customer")) {
      router.replace("/dashboard");
    }
  }, [isAuthLoading, profile, roles, router]);

  // Analytics: removed console.debug to prevent leaking user data in production

  return (
    <main className="flex min-h-full flex-col gap-6 px-4 py-6 sm:px-8 lg:px-10">
      <section className="panel p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="heading-1">Post-purchase command center</h1>
            <p className="max-w-2xl text-sm text-(--ink-muted)">
              Track every order in one place, watch delivery milestones, and see the next action without bouncing between screens.
            </p>
          </div>
          <button className="btn-secondary px-4 py-2 text-xs" onClick={() => void mutate()} type="button">
            {isLoading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </section>

      {!isAuthLoading && !user && (
        <section className="panel p-5 text-sm text-(--ink-muted)">Sign in to view your buyer dashboard.</section>
      )}

      {user && (
        <>
          {totalOrders === 0 && <BuyerOnboardingGuide />}

          <BuyerAnalyticsDashboard />

          <BuyerLoyaltyTracker />

          <section className="grid gap-4 sm:grid-cols-3">
            <div className="panel p-5 text-center">
              <p className="text-2xl font-semibold text-foreground">{totalOrders}</p>
              <p className="mt-1 text-xs text-(--ink-soft)">Total orders</p>
            </div>
            <div className="panel p-5 text-center">
              <p className="text-2xl font-semibold text-foreground">{activeOrders.length}</p>
              <p className="mt-1 text-xs text-(--ink-soft)">Active</p>
            </div>
            <div className="panel p-5 text-center">
              <p className="text-2xl font-semibold text-foreground">{recentOrders.length}</p>
              <p className="mt-1 text-xs text-(--ink-soft)">Completed</p>
            </div>
          </section>

          <section className="panel p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Active orders</h2>
                <p className="mt-1 text-xs text-(--ink-soft)">Orders still in hold, delivery, or review states.</p>
              </div>
              <Link className="text-xs font-semibold text-(--primary) hover:underline" href="/escrow">
                Open escrow list
              </Link>
            </div>

            <div className="mt-4 grid gap-4">
              {activeOrders.length > 0 ? (
                activeOrders.map((order) => <OrderCard key={order.id} order={order} />)
              ) : (
                <p className="text-sm text-(--ink-muted)">No active orders yet.</p>
              )}
            </div>
          </section>

          {activeOrders.length === 0 && totalOrders === 0 && (
            <ReactivationCampaignWidget />
          )}

          <TrustedSellersWidget sellerIds={[...activeOrders, ...recentOrders].map((o) => o.seller_id).filter((id) => !!id) as string[]} />

          <BuyerFavoritesWidget />

          <section className="panel p-5">
            <h2 className="text-sm font-semibold text-foreground">Recent orders</h2>
            <p className="mt-1 text-xs text-(--ink-soft)">Completed or recently updated orders for quick follow-up.</p>

            <div className="mt-4 grid gap-4">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => <OrderCard key={order.id} order={order} />)
              ) : (
                <p className="text-sm text-(--ink-muted)">No recent orders yet.</p>
              )}
            </div>
          </section>

          <ProtectionPerksWidget />

          <BuyerHelpWidget />
        </>
      )}

      {error && (
        <section className="panel-outline p-5 text-sm text-(--ink-muted)">
          <p className="font-semibold text-foreground">{error.title}</p>
          <p className="mt-1">{error.message}</p>
          {error.correlationId && (
            <p className="mt-2 text-xs text-(--ink-soft)">Correlation ID: {error.correlationId}</p>
          )}
        </section>
      )}
    </main>
  );
}