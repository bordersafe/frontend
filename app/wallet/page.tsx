import Link from "next/link";

export default function WalletPage() {
  const quickActions = [
    { label: "Send", href: "/wallet/send-money" },
    { label: "Cardless", href: "/wallet/cardless" },
    { label: "VAS", href: "/wallet/vas" },
  ];

  const recentActivity = [
    { label: "Dribbble", time: "Yesterday", amount: "-$15" },
    { label: "Hannah Jones", time: "3h ago", amount: "+$200" },
  ];

  return (
    <main className="flex min-h-full flex-col gap-6 px-4 py-6 sm:px-8 lg:px-10">
      <section className="rounded-[30px] bg-(--surface-alt) p-6 shadow-(--card-shadow)">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-(--ink-muted)">Hi Ben! Welcome to your wallet</p>
            <div className="mt-4 flex items-center gap-2 text-xs text-(--ink-soft)">
              <span className="rounded-full bg-white/70 px-2 py-1">USD</span>
              <span>Primary balance</span>
            </div>
            <h1 className="display-serif mt-3 text-4xl text-foreground sm:text-5xl">$12,329.20</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="h-10 w-10 rounded-full border border-white/70 bg-white/70 text-xs font-semibold text-(--ink-muted)">
              ...
            </button>
            <button className="h-10 w-10 rounded-full border border-white/70 bg-white/70 text-xs font-semibold text-(--ink-muted)">
              o
            </button>
          </div>
        </div>

        <div className="mt-4 inline-flex rounded-full bg-(--accent-positive)/20 px-3 py-1 text-xs font-semibold text-(--accent-positive-ink)">
          +2.10% this month
        </div>

        <div className="mt-5 rounded-[22px] bg-(--action) p-2">
          <div className="grid grid-cols-3 gap-2">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                className="rounded-[18px] bg-white/10 px-3 py-3 text-center text-xs font-semibold text-(--action-ink) transition hover:bg-white/15"
                href={action.href}
              >
                {action.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[26px] border border-white/70 bg-white/80 p-5 shadow-(--card-shadow) backdrop-blur">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Send again</h2>
            <span className="text-xs text-(--ink-soft)">Recent contacts</span>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-3">
            {["RA", "LO", "BI", "+"].map((initials) => (
              <div
                key={initials}
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-(--surface-alt) text-xs font-semibold text-(--ink-muted)"
              >
                {initials}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[26px] border border-white/70 bg-white/80 p-5 shadow-(--card-shadow) backdrop-blur">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Your income</h2>
            <span className="text-xs text-(--ink-soft)">This month</span>
          </div>
          <div className="mt-6 h-20 rounded-2xl bg-(--surface-alt)" />
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-(--ink-muted)">$2,432.43</span>
            <span className="rounded-full bg-(--accent-positive)/20 px-2 py-1 text-xs font-semibold text-(--accent-positive-ink)">
              +2.10%
            </span>
          </div>
        </div>
      </section>

      <section className="rounded-[26px] border border-white/70 bg-white/80 p-5 shadow-(--card-shadow) backdrop-blur">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Recent activity</h2>
          <span className="text-xs text-(--ink-soft)">View all</span>
        </div>
        <div className="mt-4 space-y-3">
          {recentActivity.map((item) => (
            <div key={item.label} className="flex items-center justify-between rounded-2xl bg-(--surface-alt) px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-foreground">{item.label}</p>
                <p className="text-xs text-(--ink-soft)">{item.time}</p>
              </div>
              <span className="text-sm font-semibold text-foreground">{item.amount}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
