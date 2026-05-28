"use client";

import Link from "next/link";
import useSWR from "swr";

import { useAuthedApi } from "@/lib/api/auth-client";
import type { EscrowDetail } from "@/lib/api/types";

type BuyerOrdersResponse = {
  active: EscrowDetail[];
  recent: EscrowDetail[];
};

export function BuyerOrdersOverview() {
  const { user, isAuthLoading, get } = useAuthedApi();
  const { data, isLoading } = useSWR<BuyerOrdersResponse>(
    !isAuthLoading && user ? ["buyer-orders", user.uid] : null,
    async () => get<BuyerOrdersResponse>("/api/escrow/buyer/summary"),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 30000,
    }
  );

  if (isLoading) {
    return (
      <section className="rounded-2xl border border-(--border-soft) bg-white p-6 shadow-sm">
        <div className="animate-pulse space-y-2">
          <div className="h-4 w-32 rounded bg-(--border)" />
          <div className="h-20 rounded bg-(--border)" />
        </div>
      </section>
    );
  }

  const activeOrders = data?.active ?? [];
  const recentOrders = data?.recent ?? [];

  return (
    <section className="space-y-6">
      {/* Active Orders */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-(--ink-soft)">
          Your Active Orders
        </h2>
        {activeOrders.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-(--border-soft) bg-(--surface) p-6 text-center">
            <p className="text-sm text-(--ink-muted)">No active orders. Start buying with protection!</p>
            <Link
              href="/escrow/new"
              className="btn-primary mt-3 inline-block px-4 py-2 text-sm"
            >
              Create New Order
            </Link>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {activeOrders.map((order) => (
              <Link
                key={order.id}
                href={`/escrow/${order.id}`}
                className="block rounded-xl border border-(--border-soft) bg-white p-4 hover:bg-(--surface) transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>

                    <p className="mt-1 font-semibold text-foreground text-sm">{order.id}</p>
                    <p className="mt-1 text-xs text-(--ink-muted)">
                      {order.amount} {order.currency}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                        order.status === "FUNDS_LOCKED"
                          ? "bg-blue-100 text-blue-800"
                          : order.status === "DELIVERED_AWAITING_BUYER_CONFIRMATION"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-green-100 text-green-800"
                      }`}
                    >
                      {order.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent Orders */}
      {recentOrders.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-(--ink-soft)">
            Recent Orders
          </h2>
          <div className="mt-4 space-y-2">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/escrow/${order.id}`}
                className="block rounded-lg border border-(--border-soft) bg-(--surface) px-4 py-3 text-sm hover:bg-white transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-(--ink-muted)">{order.id}</span>
                  <span className="text-xs text-(--ink-soft)">{order.status}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
