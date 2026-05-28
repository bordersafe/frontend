"use client";

import Link from "next/link";
import useSWR from "swr";

import { useAuthedApi } from "@/lib/api/auth-client";
import type { SellerPublicProfileResponse } from "@/lib/api/types";

const BADGE_META: Record<string, { label: string; tone: string }> = {
  VERIFIED: {
    label: "Verified Seller",
    tone: "bg-green-100 text-green-800 border-green-200",
  },
  FAST_PAYOUT: {
    label: "Fast Payout",
    tone: "bg-blue-100 text-blue-800 border-blue-200",
  },
  HIGH_RATING: {
    label: "High Rating",
    tone: "bg-amber-100 text-amber-800 border-amber-200",
  },
  RESPONSIVE_SELLER: {
    label: "Responsive Seller",
    tone: "bg-violet-100 text-violet-800 border-violet-200",
  },
};

export function SellerReputationCard() {
  const { profile, get } = useAuthedApi();
  const { data, isLoading, isValidating } = useSWR<SellerPublicProfileResponse>(
    "seller-reputation",
    async () => get<SellerPublicProfileResponse>("/api/sellers/me/reputation"),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 45000,
    }
  );

  if (isLoading) {
    return (
      <section className="panel p-6 bg-(--surface-alt)">
        <p className="text-sm text-(--ink-muted)">Loading reputation...</p>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="panel p-6 bg-(--surface-alt)">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-(--ink-soft)">
              Seller Reputation
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">No reputation data yet</h2>
            <p className="mt-1 text-sm text-(--ink-muted)">Your public profile will appear after you complete a few escrows.</p>
          </div>
          {profile?.id ? (
            <Link
              href={`/sellers/${profile.id}`}
              className="rounded-lg border border-(--border-soft) bg-white px-3 py-2 text-xs font-semibold text-(--ink-muted) hover:bg-(--surface-hovered)"
            >
              View Public Profile
            </Link>
          ) : null}
        </div>
        <div className="mt-4 text-xs text-(--ink-soft)">{isValidating ? "Refreshing reputation..." : ""}</div>
      </section>
    );
  }

  const kycLabel =
    data.compliance.kyc_status === "VERIFIED"
      ? "Verified"
      : data.compliance.kyc_status === "PENDING"
        ? "Pending Review"
        : data.compliance.kyc_status === "REJECTED"
          ? "Rejected"
          : "Not Submitted";

  const complianceLabel =
    data.compliance.compliance_status === "COMPLIANT"
      ? "Compliant"
      : data.compliance.compliance_status === "FLAGGED"
        ? "Flagged"
        : "Under Review";

  return (
    <section className="panel p-6 bg-(--surface-alt)">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-(--ink-soft)">
            Seller Reputation
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-foreground">
            {data.ratings.average > 0 ? `${data.ratings.average.toFixed(1)} / 5.0` : "No ratings yet"}
          </h2>
          <p className="mt-1 text-sm text-(--ink-muted)">
            {data.ratings.total} buyer rating{data.ratings.total === 1 ? "" : "s"}
          </p>
        </div>
        {profile?.id ? (
          <Link
            href={`/sellers/${profile.id}`}
            className="rounded-lg border border-(--border-soft) bg-white px-3 py-2 text-xs font-semibold text-(--ink-muted) hover:bg-(--surface-hovered)"
          >
            View Public Profile
          </Link>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {data.badges.length === 0 ? (
          <span className="rounded-full border border-(--border-soft) px-3 py-1 text-xs text-(--ink-muted)">
            No badges yet
          </span>
        ) : (
          data.badges.map((badge) => {
            const meta = BADGE_META[badge];
            return (
              <span
                key={badge}
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${meta?.tone ?? "bg-slate-100 text-slate-700 border-slate-200"}`}
              >
                {meta?.label ?? badge}
              </span>
            );
          })
        )}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl border border-(--border-soft) bg-white p-3">

          <p className="mt-1 font-semibold text-foreground">{kycLabel}</p>
        </div>
        <div className="rounded-xl border border-(--border-soft) bg-white p-3">

          <p className="mt-1 font-semibold text-foreground">{complianceLabel}</p>
        </div>
      </div>

      <div className="mt-4">
        <Link
          href="/wallet"
          className="text-xs font-semibold text-(--primary) hover:underline"
        >
          Manage payout speed to unlock Fast Payout badge
        </Link>
      </div>
      {isValidating && <p className="mt-3 text-xs text-(--ink-soft)">Refreshing reputation...</p>}
    </section>
  );
}
