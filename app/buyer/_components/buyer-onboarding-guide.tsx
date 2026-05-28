"use client";

import Link from "next/link";
import { useState } from "react";

export function BuyerOnboardingGuide() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return null;
  }

  const steps = [
    {
      number: 1,
      title: "Browse trusted sellers",
      description: "Look for sellers with high ratings (4.5+), verified badges, and 90%+ response rates.",
      icon: "🔍",
    },
    {
      number: 2,
      title: "Make your purchase",
      description: "Funds are held in escrow until delivery. You're protected from the start.",
      icon: "💳",
    },
    {
      number: 3,
      title: "Confirm delivery",
      description: "Inspect the goods. If all looks good, confirm and the seller gets paid.",
      icon: "📦",
    },
    {
      number: 4,
      title: "Leave a review",
      description: "Share your experience to help other buyers and build seller accountability.",
      icon: "⭐",
    },
  ];

  return (
    <section className="rounded-3xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-7 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Welcome to VendOpay</h2>
          <p className="mt-1 text-sm text-(--ink-muted)">
            Here's how to safely buy with confidence on our platform
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-2xl hover:opacity-60"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        {steps.map((step) => (
          <div key={step.number} className="flex flex-col items-center rounded-xl bg-white p-4 text-center shadow-sm">
            <div className="text-3xl">{step.icon}</div>
            <div className="mt-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
              {step.number}
            </div>
            <h3 className="mt-2 font-semibold text-foreground text-sm">{step.title}</h3>
            <p className="mt-1 text-xs text-(--ink-muted)">{step.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-white/50 px-4 py-3">
        <div className="text-sm">
          <p className="font-semibold text-foreground">Need help?</p>
          <p className="text-(--ink-muted)">Check out our trust center for buyer protections and policies.</p>
        </div>
        <Link
          href="/trust-center"
          className="whitespace-nowrap text-sm font-semibold text-(--primary) hover:underline"
        >
          Learn more →
        </Link>
      </div>
    </section>
  );
}
