"use client";

import Link from "next/link";

import { AUTH_ROLE_CONFIG, type AuthRole } from "../roles";

type Action = {
  label: string;
  href: string;
};

type AuthRoleHubProps = {
  role: AuthRole;
  title: string;
  subtitle: string;
  primaryAction: Action;
  secondaryAction?: Action;
  notice?: string;
};

export function AuthRoleHub({
  role,
  title,
  subtitle,
  primaryAction,
  secondaryAction,
  notice,
}: AuthRoleHubProps) {
  const roleConfig = AUTH_ROLE_CONFIG[role];

  return (
    <main className="page-shell grid min-h-full gap-8 px-4 py-8 sm:px-8 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="relative overflow-hidden rounded-4xl p-7 shadow-(--shell-shadow)">
        <div className="absolute inset-0 section-aurora" />
        <div className="relative space-y-6">
          <div>

            <h1 className="heading-1">{title}</h1>
            <p className="mt-3 text-sm text-(--ink-muted)">{subtitle}</p>
          </div>
          <div className="panel-strong p-4 text-sm">
            <p className="text-base font-semibold">{roleConfig.focus}</p>
            <p className="mt-2 text-xs text-(--ink-muted)">{roleConfig.description}</p>
          </div>
          {notice && <div className="text-xs text-(--ink-muted)">{notice}</div>}
        </div>
      </section>

      <section className="panel p-6">
        <div className="space-y-2">
          <h2 className="heading-2">{roleConfig.label} workspace</h2>
          <p className="mt-2 text-sm text-(--ink-muted)">Use the flow that matches your account.</p>
        </div>

        <div className="mt-6 space-y-3">
          <Link className="btn-primary block w-full px-4 py-3 text-center text-sm" href={primaryAction.href}>
            {primaryAction.label}
          </Link>
          {secondaryAction && (
            <Link className="btn-secondary block w-full px-4 py-3 text-center text-sm" href={secondaryAction.href}>
              {secondaryAction.label}
            </Link>
          )}
        </div>

        <div className="mt-6 rounded-2xl border border-(--border-soft) bg-(--surface-highlight) p-4 text-sm text-(--ink-muted)">
          <p className="font-semibold text-foreground">What happens next</p>
          <p className="mt-2">After sign-in, VendOpay routes you to the matching buyer, seller, or admin workspace based on your account roles.</p>
        </div>
      </section>
    </main>
  );
}