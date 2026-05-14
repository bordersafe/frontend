import Link from "next/link";

import { AUTH_ROLE_CONFIG, AUTH_ROLE_ORDER } from "./roles";

export default function AuthHubPage() {
  return (
    <main className="page-shell flex min-h-full flex-col gap-10 px-4 py-10 sm:px-8">
      <section className="relative overflow-hidden rounded-[36px] p-8 shadow-(--shell-shadow)">
        <div className="absolute inset-0 section-aurora" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/45 to-white/10" />
        <div className="relative z-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <h1 className="heading-1">
              The role access hub for every BorderSafe operator.
            </h1>
            <p className="text-sm leading-6 text-(--ink-muted)">
              Choose the workspace that matches how you operate. Each role signs in through a
              dedicated surface with the right tools, queues, and actions already in focus.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="panel-muted p-4 text-sm text-(--ink-muted)">
                Buyers confirm delivery signals and release funds only after the item is received.
              </div>
              <div className="panel-muted p-4 text-sm text-(--ink-muted)">
                Sellers create escrows and issue Squad virtual accounts for each order.
              </div>
              <div className="panel-muted p-4 text-sm text-(--ink-muted)">
                Admins resolve escalations with AI context and evidence.
              </div>
              <div className="panel-muted p-4 text-sm text-(--ink-muted)">
                Every route keeps an auditable trail.
              </div>
            </div>
          </div>

          <div className="panel p-6">
            <h2 className="heading-3">Quick role links</h2>
            <p className="mt-2 text-sm text-(--ink-muted)">
              Jump straight to the right sign-in flow. Google and email are both available on each
              route.
            </p>
            <div className="mt-5 grid gap-3">
              {AUTH_ROLE_ORDER.map((role) => {
                const roleConfig = AUTH_ROLE_CONFIG[role];
                return (
                  <Link
                    key={role}
                    className="btn-secondary w-full px-4 py-3 text-left text-sm"
                    href={`/auth/login?role=${role}`}
                  >
                    {roleConfig.label} sign in
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {AUTH_ROLE_ORDER.map((role) => {
          const roleConfig = AUTH_ROLE_CONFIG[role];
          return (
            <article key={role} className="panel p-6 lift-hover">
              <h2 className="heading-3">{roleConfig.label}</h2>
              <p className="mt-3 text-sm text-(--ink-muted)">{roleConfig.description}</p>
              <p className="mt-4 text-sm font-semibold text-foreground">{roleConfig.focus}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link className="btn-primary px-4 py-2 text-xs" href={`/auth/${role}`}>
                  Continue as {roleConfig.label}
                </Link>
                <Link className="btn-secondary px-4 py-2 text-xs" href={`/auth/login?role=${role}`}>
                  Email or Google sign-in
                </Link>
              </div>
            </article>
          );
        })}
      </section>

      <section className="panel p-6 text-sm text-(--ink-muted)">
        <h2 className="heading-3">Need access?</h2>
        <p className="mt-3">
          If you do not see your role listed, request an invite from your BorderSafe admin.
        </p>
      </section>
    </main>
  );
}
