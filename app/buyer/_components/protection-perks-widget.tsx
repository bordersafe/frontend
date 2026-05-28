"use client";

import useSWR from "swr";

import { useAuthedApi } from "@/lib/api/auth-client";
import type { BuyerOrderSummaryResponse } from "@/lib/api";

export function ProtectionPerksWidget() {
  const { get, user, isAuthLoading } = useAuthedApi();

  const { data } = useSWR<BuyerOrderSummaryResponse>(
    !isAuthLoading && !!user ? ["buyer-protection-perks", user.uid] : null,
    async () => get<BuyerOrderSummaryResponse>("/api/escrow/buyer/summary"),
    { revalidateOnFocus: false }
  );

  const totalOrders = (data?.active.length ?? 0) + (data?.recent.length ?? 0);
  const completedOrders = data?.recent.filter((order) =>
    ["DISBURSED", "AWAITING_ADMIN_FINALIZATION"].includes(order.status)
  ).length ?? 0;
  const priorityEligible = completedOrders >= 3;
  const fastRefundEligible = completedOrders >= 1;
  const protectionCreditEligible = completedOrders >= 5;

  const perks = [
    {
      id: "fast-refund-24h",
      label: "Fast Refund (24h)",
      description: fastRefundEligible
        ? "Active: eligible for instant refund handling when dispute is approved"
        : "Unlock after your first successfully completed order",
      tone: fastRefundEligible
        ? "bg-emerald-50 border-emerald-200 text-emerald-900"
        : "bg-slate-50 border-slate-200 text-slate-700",
      icon: "⚡",
    },
    {
      id: "protection-credit",
      label: "Protection Credit",
      description: protectionCreditEligible
        ? "Active: earned protection credit for your next checkout"
        : `Unlock at 5 completed orders (${Math.max(0, 5 - completedOrders)} to go)`,
      tone: protectionCreditEligible
        ? "bg-sky-50 border-sky-200 text-sky-900"
        : "bg-slate-50 border-slate-200 text-slate-700",
      icon: "🛡️",
    },
    {
      id: "priority-support",
      label: "Priority Support",
      description: priorityEligible
        ? "Active: faster dispute routing and resolution"
        : `Unlock at 3 completed orders (${Math.max(0, 3 - completedOrders)} to go)`,
      tone: priorityEligible
        ? "bg-violet-50 border-violet-200 text-violet-900"
        : "bg-slate-50 border-slate-200 text-slate-700",
      icon: "⭐",
    },
  ];

  return (
    <section className="rounded-3xl border border-(--border-soft) bg-white p-7 shadow-sm">
      <h2 className="text-lg font-semibold text-foreground">Buyer protection perks</h2>
      <p className="mt-1 text-sm text-(--ink-muted)">Earn benefits through successful purchases and positive interactions</p>

      <div className="mt-4 grid gap-3">
        {perks.map((perk) => (
          <div key={perk.id} className={`rounded-xl border px-4 py-3 ${perk.tone}`}>
            <div className="flex items-start gap-3">
              <span className="text-lg">{perk.icon}</span>
              <div>
                <p className="font-semibold">{perk.label}</p>
                <p className="mt-1 text-sm opacity-90">{perk.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs text-(--ink-soft)">
        💡 Completed orders: {completedOrders}. Total tracked orders: {totalOrders}. Keep purchasing and reviewing to unlock more benefits.
      </p>
    </section>
  );
}
