"use client";

import { useAuthedApi } from "@/lib/api/auth-client";
import { EarningsWidget } from "./_components/earnings-widget";
import { ActiveEscrowsWidget } from "./_components/active-escrows-widget";
import { RecentActivityFeed } from "./_components/recent-activity-feed";
import { EscrowListWithFilters } from "./_components/escrow-list-with-filters";

export default function DashboardPage() {
  const { profile, isAuthLoading } = useAuthedApi();
  const isSeller = profile?.roles?.includes("vendor");

  if (isAuthLoading) {
    return (
      <main className="flex flex-col gap-8 animate-pulse">
        <div className="h-12 bg-(--border) rounded w-48" />
        <div className="grid grid-cols-2 gap-6">
          <div className="h-40 bg-(--border) rounded" />
          <div className="h-40 bg-(--border) rounded" />
        </div>
      </main>
    );
  }

  if (!isSeller) {
    return (
      <main className="flex flex-col gap-8">
        <header>
          <h1 className="heading-1">Dashboard</h1>
          <p className="text-sm text-(--ink-muted) mt-2">You need seller access to view this dashboard.</p>
        </header>
      </main>
    );
  }

  return (
    <main className="flex flex-col gap-8">
      <header>
        <h1 className="heading-1">Seller Dashboard</h1>
        <p className="text-sm text-(--ink-muted) mt-2">Track your earnings, escrows, and activity.</p>
      </header>

      {/* Earnings & Active Escrows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EarningsWidget />
        <ActiveEscrowsWidget />
      </div>

      {/* Recent Activity */}
      <RecentActivityFeed />

      {/* Escrow List with Filters */}
      <section>
        <h2 className="heading-2 mb-4">All Escrows</h2>
        <EscrowListWithFilters />
      </section>
    </main>
  );
}
