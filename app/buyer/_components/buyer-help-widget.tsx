"use client";

import Link from "next/link";
import { useState } from "react";

type HelpArticle = {
  id: string;
  title: string;
  description: string;
  href: string;
  category: "quick-help" | "protection" | "dispute";
  icon: string;
};

export function BuyerHelpWidget() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const articles: HelpArticle[] = [
    {
      id: "how-to-confirm",
      title: "How to confirm delivery",
      description: "Steps to confirm you've received your order and release payment to the seller",
      href: "/trust-center#how-it-works",
      category: "quick-help",
      icon: "📦",
    },
    {
      id: "open-dispute",
      title: "How to open a dispute",
      description: "If goods don't match or don't arrive, open a dispute with evidence",
      href: "/trust-center#faq",
      category: "quick-help",
      icon: "⚠️",
    },
    {
      id: "money-protection",
      title: "Money-back guarantee",
      description: "Learn how your funds are protected from the moment you order",
      href: "/trust-center#protection",
      category: "protection",
      icon: "🛡️",
    },
    {
      id: "buyer-guarantees",
      title: "Your buyer protections",
      description: "Full breakdown of protection promises and SLAs",
      href: "/trust-center#sla",
      category: "protection",
      icon: "✓",
    },
    {
      id: "dispute-process",
      title: "Dispute resolution process",
      description: "Timeline and steps for AI analysis and human review",
      href: "/trust-center#how-it-works",
      category: "dispute",
      icon: "⏱️",
    },
    {
      id: "appeals",
      title: "Appeal a dispute decision",
      description: "How to appeal if you disagree with our decision",
      href: "/trust-center",
      category: "dispute",
      icon: "📤",
    },
  ];

  const categories = {
    "quick-help": {
      label: "Quick Help",
      description: "Urgent questions about orders and disputes",
      icon: "⚡",
    },
    protection: {
      label: "Your Protections",
      description: "How BorderSafe protects your purchases",
      icon: "🔒",
    },
    dispute: {
      label: "Dispute Help",
      description: "Information about dispute resolution",
      icon: "📋",
    },
  };

  return (
    <section className="panel p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Need Help?</h2>
          <p className="mt-1 text-sm text-(--ink-soft)">
            Find answers to common questions and get support
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {Object.entries(categories).map(([catKey, catData]) => {
          const categoryArticles = articles.filter((a) => a.category === catKey);
          const isExpanded = expandedCategory === catKey;

          return (
            <div key={catKey} className="rounded-lg border border-(--border-soft) bg-(--surface-alt) overflow-hidden">
              <button
                onClick={() => setExpandedCategory(isExpanded ? null : catKey)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3 text-left">
                  <span className="text-lg">{catData.icon}</span>
                  <div>
                    <p className="font-semibold text-foreground">{catData.label}</p>
                    <p className="text-xs text-(--ink-soft)">{catData.description}</p>
                  </div>
                </div>
                <span className={`text-lg transition-transform ${isExpanded ? "rotate-180" : ""}`}>
                  ▼
                </span>
              </button>

              {isExpanded && (
                <div className="border-t border-(--border-soft) bg-white/50">
                  {categoryArticles.map((article) => (
                    <Link
                      key={article.id}
                      href={article.href}
                      className="block px-4 py-3 border-b border-(--border-soft) last:border-b-0 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-base mt-0.5">{article.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground text-sm">{article.title}</p>
                          <p className="text-xs text-(--ink-muted) mt-0.5">{article.description}</p>
                        </div>
                        <span className="text-(--ink-soft) ml-2">→</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-lg bg-blue-50 border border-blue-200 p-4">
        <p className="text-sm font-semibold text-blue-900">Can't find what you need?</p>
        <p className="text-xs text-blue-800 mt-1">
          Contact our support team at{" "}
          <a href="mailto:support@bordersafe.ng" className="font-semibold hover:underline">
            support@bordersafe.ng
          </a>
        </p>
      </div>
    </section>
  );
}
