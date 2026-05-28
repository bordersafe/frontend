"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useAuthedApi } from "@/lib/api/auth-client";

type CampaignOffer = {
  id: string;
  headline: string;
  description: string;
  cta: string;
  ctaHref: string;
  badge?: string;
  icon: string;
  tone: string;
};

export function ReactivationCampaignWidget({ lastPurchaseDate }: { lastPurchaseDate?: string | null }) {
  const { post, user, isAuthLoading } = useAuthedApi();
  const [dismissed, setDismissed] = useState(false);

  // Determine campaign based on time since last purchase
  // In production, this would be calculated on the backend
  const campaigns: CampaignOffer[] = [
    {
      id: "new-seller-protection",
      headline: "New seller protection features",
      description: "We've added faster refunds, response rate tracking, and seller trust profiles to help you buy with confidence.",
      cta: "Explore trusted sellers",
      ctaHref: "/buyer",
      badge: "NEW",
      icon: "🛡️",
      tone: "from-emerald-50 to-emerald-100 border-emerald-200",
    },
    {
      id: "buyer-rewards",
      headline: "Unlock buyer protection credits",
      description: "Return to BorderSafe and earn credits toward your next purchase. Every successful order builds your trust tier.",
      cta: "Start shopping",
      ctaHref: "/buyer",
      badge: "EXCLUSIVE",
      icon: "💳",
      tone: "from-amber-50 to-amber-100 border-amber-200",
    },
    {
      id: "top-sellers",
      headline: "Handpicked sellers just for you",
      description: "Verified, highly-rated sellers with 90%+ response rates are waiting. Browse curated shops with your favorite products.",
      cta: "Browse now",
      ctaHref: "/buyer",
      icon: "⭐",
      tone: "from-violet-50 to-violet-100 border-violet-200",
    },
  ];

  const daysSinceLastPurchase = useMemo(() => {
    if (!lastPurchaseDate) {
      return null;
    }
    const delta = Date.now() - new Date(lastPurchaseDate).getTime();
    return Math.floor(delta / (24 * 60 * 60 * 1000));
  }, [lastPurchaseDate]);

  const campaign = useMemo(() => {
    if (daysSinceLastPurchase !== null && daysSinceLastPurchase >= 60) {
      return campaigns[1] ?? campaigns[0];
    }
    if (daysSinceLastPurchase !== null && daysSinceLastPurchase >= 30) {
      return campaigns[2] ?? campaigns[0];
    }
    return campaigns[0];
  }, [campaigns, daysSinceLastPurchase]);

  const trackEvent = async (action: "viewed" | "cta_clicked" | "dismissed") => {
    if (isAuthLoading || !user) {
      return;
    }

    try {
      await post("/api/escrow/buyer/campaign-events", {
        campaign_id: campaign.id,
        action,
        placement: "buyer_dashboard",
        metadata: {
          days_since_last_purchase: daysSinceLastPurchase,
          cta_href: campaign.ctaHref,
        },
      });
    } catch {
      // Non-blocking analytics.
    }
  };

  useEffect(() => {
    void trackEvent("viewed");
  }, [campaign.id]);

  if (dismissed) {
    return null;
  }

  return (
    <section className={`rounded-3xl border-2 ${campaign.tone} bg-linear-to-br p-7 shadow-sm`}>
      <div className="flex items-start gap-4">
        <div className="text-4xl">{campaign.icon}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">{campaign.headline}</h2>
            {campaign.badge && (
              <span className="inline-block rounded-full bg-white/60 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-(--primary)">
                {campaign.badge}
              </span>
            )}
          </div>
          <p className="mt-2 text-sm text-(--ink-muted)">{campaign.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={campaign.ctaHref}
              className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm"
              onClick={() => {
                void trackEvent("cta_clicked");
              }}
            >
              {campaign.cta} →
            </Link>
            <button
              className="rounded-lg border border-(--border) bg-white px-4 py-2 text-sm font-medium text-foreground hover:bg-(--border-soft)"
              onClick={() => {
                setDismissed(true);
                void trackEvent("dismissed");
              }}
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
