"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthedApi } from "@/lib/api/auth-client";
import { canAccessBuyerWorkspace, canAccessVendorWorkspace } from "@/lib/roles";
import { EarningsWidget } from "./_components/earnings-widget";
import { ActiveEscrowsWidget } from "./_components/active-escrows-widget";
import { RecentActivityFeed } from "./_components/recent-activity-feed";
import { EscrowListWithFilters } from "./_components/escrow-list-with-filters";
import { SellerReputationCard } from "./_components/seller-reputation-card";

export default function DashboardPage() {
  const router = useRouter();
  const { profile, isAuthLoading } = useAuthedApi();
  const roles = profile?.roles;
  const isVendor = canAccessVendorWorkspace(roles);
  const isBuyer = canAccessBuyerWorkspace(roles);

  useEffect(() => {
    if (isAuthLoading || !profile) {
      return;
    }

    if (roles?.some((role) => ["admin", "super_admin", "hitl"].includes(role))) {
      router.replace("/admin");
      return;
    }

    if (isBuyer && !isVendor) {
      router.replace("/buyer");
      return;
    }

    if (!isVendor) {
      router.replace("/admin");
    }
  }, [isAuthLoading, isBuyer, isVendor, profile, router, roles]);

  if (isAuthLoading) {
    return (
      <main className="flex flex-col gap-8">
        <div className="skeleton h-12 w-48 rounded" />
        <div className="grid grid-cols-2 gap-6">
          <div className="skeleton h-40 rounded" />
          <div className="skeleton h-40 rounded" />
        </div>
      </main>
    );
  }

  if (!isVendor) {
    return (
      <main className="flex flex-col gap-8">
        <header>
          <h1 className="heading-1">Dashboard</h1>
          <p className="text-sm text-(--ink-muted) mt-2">Redirecting to the workspace that matches your role.</p>
        </header>
      </main>
    );
  }

  return (
    <main className="flex flex-col gap-8">
      <header>
        <h1 className="heading-1">Vendor Dashboard</h1>
        <p className="text-sm text-(--ink-muted) mt-2">Track your earnings, escrows, and activity.</p>
      </header>

      {/* Earnings & Active Escrows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EarningsWidget />
        <ActiveEscrowsWidget />
      </div>

      <SellerReputationCard />

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
