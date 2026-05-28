"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthedApi } from "@/lib/api/auth-client";
import { NotificationPreferencesWidget } from "../_components/notification-preferences-widget";

const BUYER_PROTECTIONS = [
  {
    icon: "✓",
    title: "100% Money-Back Guarantee",
    body: "If goods don't arrive or don't match the listing, you get a full refund.",
    cls: "border-(--success)",
  },
  {
    icon: "⏱️",
    title: "24-Hour Dispute Resolution",
    body: "We review and decide disputes within 24 hours using AI analysis and seller evidence.",
    cls: "border-(--info)",
  },
  {
    icon: "🚨",
    title: "Auto-Escalation Protection",
    body: "If a seller doesn't respond or ship within SLA, we automatically escalate to our support team.",
    cls: "border-(--warning)",
  },
  {
    icon: "📱",
    title: "Real-Time Tracking",
    body: "Track every step of your order: payment locked, shipped, in transit, delivered, and dispute status.",
    cls: "border-(--primary)",
  },
];

export default function BuyerSettingsPage() {
  const router = useRouter();
  const { user, profile } = useAuthedApi();

  if (!user) {
    return (
      <main className="flex min-h-full flex-col gap-6 px-4 py-6 sm:px-8 lg:px-10">
        <section className="panel-danger p-6 rounded-2xl text-sm text-center reveal-up">
          Sign in to manage your buyer settings.
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-full flex-col gap-6 px-4 py-6 sm:px-8 lg:px-10">
      {/* Header */}
      <header className="panel p-6 reveal-up flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-(--action)/10 text-2xl flex-shrink-0">
          ⚙️
        </div>
        <div>
          <h1 className="heading-2">Settings</h1>
          <p className="mt-1 text-sm text-(--ink-muted)">
            Manage your notifications, preferences, and account details.
          </p>
        </div>
      </header>

      {/* Account Information */}
      <section className="panel p-6 reveal-up delay-80">
        <div className="space-y-3">
          <div className="panel-muted rounded-2xl px-4 py-3">
            <p className="mt-1.5 text-sm font-semibold text-foreground">{user.email || "Not set"}</p>
          </div>
          <div className="panel-muted rounded-2xl px-4 py-3">
            <p className="mt-1.5 font-mono text-xs text-foreground break-all">{profile?.id ?? user.uid}</p>
          </div>
          <div className="panel-muted rounded-2xl px-4 py-3">
            <p className="mt-1.5 text-sm font-semibold text-foreground">
              {new Date(profile?.created_at || Date.now()).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
        <div className="mt-5 pt-4 border-t border-(--border-soft)">
          <button
            className="text-sm font-semibold text-(--primary) hover:underline"
            onClick={() => router.push("/auth/profile")}
            type="button"
          >
            Edit profile →
          </button>
        </div>
      </section>

      {/* Notification Preferences */}
      <section className="panel p-6 reveal-up delay-160">
        <p className="mb-5 text-sm text-(--ink-muted)">
          Control how and when you want to be notified about your orders, disputes, and platform updates.
        </p>
        <NotificationPreferencesWidget />
      </section>

      {/* Buyer Protections */}
      <section className="panel p-6 reveal-up delay-240">
        <div className="grid gap-3 sm:grid-cols-2">
          {BUYER_PROTECTIONS.map((p, i) => (
            <div key={i} className={`panel-muted rounded-2xl px-4 py-4 border-l-4 ${p.cls} flex items-start gap-3`}>
              <span className="text-xl flex-shrink-0">{p.icon}</span>
              <div>
                <p className="text-sm font-bold text-foreground">{p.title}</p>
                <p className="mt-1 text-xs text-(--ink-muted)">{p.body}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 pt-4 border-t border-(--border-soft)">
          <Link
            href="/trust-center"
            className="text-sm font-semibold text-(--primary) hover:underline"
          >
            Visit Trust Center for full details →
          </Link>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="panel p-6 border-l-4 border-(--danger) reveal-up delay-320">
        <div className="space-y-3">
          <button className="btn-outline w-full border-2 border-(--danger)/40 py-2.5 text-sm font-semibold text-(--danger) hover:bg-(--danger)/5 transition-colors" type="button">
            Sign out from all devices
          </button>
          <button className="w-full rounded-2xl border-2 border-(--danger) bg-white px-4 py-2.5 text-sm font-semibold text-(--danger) hover:bg-(--danger)/5 transition-colors" type="button">
            Delete my account
          </button>
        </div>
        <p className="mt-4 text-xs text-(--ink-muted)">
          These actions are irreversible. Deleting your account will remove all your order history and messages.
        </p>
      </section>
    </main>
  );
}
