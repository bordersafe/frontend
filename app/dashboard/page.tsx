"use client";

import Link from "next/link";
type IconProps = { className?: string };
type IconComponent = (props: IconProps) => JSX.Element;

const IconGrid: IconComponent = ({ className = "h-5 w-5" }) => (
  <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
    <path
      d="M4 4h7v7H4V4Zm9 0h7v7h-7V4Zm-9 9h7v7H4v-7Zm9 0h7v7h-7v-7Z"
      stroke="currentColor"
      strokeWidth="1.6"
    />
  </svg>
);

const IconLock: IconComponent = ({ className = "h-5 w-5" }) => (
  <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
    <path
      d="M7 10V7a5 5 0 0 1 10 0v3"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    <rect x="5" y="10" width="14" height="10" rx="2.4" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

const IconEye: IconComponent = ({ className = "h-5 w-5" }) => (
  <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
    <path
      d="M2.5 12s3.6-6 9.5-6 9.5 6 9.5 6-3.6 6-9.5 6-9.5-6-9.5-6Z"
      stroke="currentColor"
      strokeWidth="1.6"
    />
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

const IconWallet: IconComponent = ({ className = "h-5 w-5" }) => (
  <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
    <path
      d="M4 7h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z"
      stroke="currentColor"
      strokeWidth="1.6"
    />
    <path d="M4 7V6a2 2 0 0 1 2-2h11" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="16.5" cy="12.5" r="1.5" fill="currentColor" />
  </svg>
);

const IconShield: IconComponent = ({ className = "h-5 w-5" }) => (
  <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
    <path
      d="M12 3 19 6v6c0 4.4-3 7.4-7 9-4-1.6-7-4.6-7-9V6l7-3Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconSettings: IconComponent = ({ className = "h-5 w-5" }) => (
  <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
    <path
      d="M12 8.4a3.6 3.6 0 1 1 0 7.2 3.6 3.6 0 0 1 0-7.2Z"
      stroke="currentColor"
      strokeWidth="1.6"
    />
    <path
      d="m4.9 9.2 1-1.8-1-1.8 2-2 1.8 1 1.8-1h2.8l1.8 1 1.8-1 2 2-1 1.8 1 1.8v2.8l-1 1.8 1 1.8-2 2-1.8-1-1.8 1h-2.8l-1.8-1-1.8 1-2-2 1-1.8-1-1.8v-2.8Z"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
  </svg>
);

const IconPulse: IconComponent = ({ className = "h-5 w-5" }) => (
  <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
    <path
      d="M3 12h4l2-5 4 10 2-5h4"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconBell: IconComponent = ({ className = "h-5 w-5" }) => (
  <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
    <path
      d="M6 9a6 6 0 1 1 12 0c0 5 2 5 2 7H4c0-2 2-2 2-7Z"
      stroke="currentColor"
      strokeWidth="1.6"
    />
    <path d="M10 18a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

const IconSpark: IconComponent = ({ className = "h-5 w-5" }) => (
  <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
    <path d="m12 3 2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2L12 3Z" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

const IconSearch: IconComponent = ({ className = "h-5 w-5" }) => (
  <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.6" />
    <path d="m16 16 5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const NAV_LINKS: Array<{ label: string; href: string; Icon: IconComponent }> = [
  { label: "Overview", href: "/dashboard", Icon: IconGrid },
  { label: "Escrows", href: "/escrow/new", Icon: IconLock },
  { label: "Reviews", href: "/escrow/2045", Icon: IconEye },
  { label: "Wallet", href: "/wallet", Icon: IconWallet },
  { label: "Compliance", href: "/dashboard", Icon: IconShield },
  { label: "Settings", href: "/dashboard", Icon: IconSettings },
];

const SUMMARY: Array<{ label: string; value: string; trend: string; Icon: IconComponent }> = [
  { label: "Active escrows", value: "142", trend: "+8 today", Icon: IconPulse },
  { label: "Awaiting verification", value: "18", trend: "3 due in 2 hrs", Icon: IconEye },
  { label: "Human review", value: "6", trend: "2 high priority", Icon: IconShield },
  { label: "Released today", value: "$84,230", trend: "+12.6% WoW", Icon: IconWallet },
];

const ACTIVE_ESCROWS = [
  {
    id: "ESC-2043",
    buyer: "Ada Okoye",
    seller: "Lagos Textile Co.",
    amount: "$1,240",
    corridor: "NGN to USD",
    status: "IN_TRANSIT",
    risk: "Low",
    updated: "12m ago",
    href: "/escrow/2043",
  },
  {
    id: "ESC-2044",
    buyer: "Kofi Mensah",
    seller: "Accra Gadgets Ltd.",
    amount: "$3,820",
    corridor: "GHS to USD",
    status: "VERIFYING",
    risk: "Medium",
    updated: "28m ago",
    href: "/escrow/2044",
  },
  {
    id: "ESC-2045",
    buyer: "Zuri Housewares",
    seller: "Nairobi Auto Parts",
    amount: "$6,410",
    corridor: "KES to USD",
    status: "AWAITING_HUMAN_REVIEW",
    risk: "High",
    updated: "52m ago",
    href: "/escrow/2045",
  },
  {
    id: "ESC-2046",
    buyer: "Maputo Imports",
    seller: "Johannesburg Furnishings",
    amount: "$2,960",
    corridor: "ZAR to USD",
    status: "FUNDS_LOCKED",
    risk: "Low",
    updated: "1h ago",
    href: "/escrow/2046",
  },
  {
    id: "ESC-2047",
    buyer: "Abuja Retail Collective",
    seller: "Cairo Electronics",
    amount: "$4,120",
    corridor: "NGN to EGP",
    status: "AWAITING_PAYMENT",
    risk: "Medium",
    updated: "2h ago",
    href: "/escrow/2047",
  },
];

const REVIEW_QUEUE = [
  {
    id: "ESC-2029",
    seller: "Kigali Fashion House",
    reason: "Image mismatch on branding",
    confidence: "78%",
    updated: "35m ago",
    href: "/escrow/2029",
  },
  {
    id: "ESC-2032",
    seller: "Durban Auto Spares",
    reason: "Delivery scan failed",
    confidence: "65%",
    updated: "1h ago",
    href: "/escrow/2032",
  },
  {
    id: "ESC-2036",
    seller: "Lusaka Phone Traders",
    reason: "Missing delivery photo",
    confidence: "71%",
    updated: "2h ago",
    href: "/escrow/2036",
  },
];

const PAYOUTS = [
  { id: "PAYOUT-8891", beneficiary: "Lagos Textile Co.", amount: "$1,240", status: "COMPLETED", time: "10:24 AM" },
  { id: "PAYOUT-8892", beneficiary: "Accra Gadgets Ltd.", amount: "$3,820", status: "PENDING", time: "09:58 AM" },
  { id: "PAYOUT-8893", beneficiary: "Johannesburg Furnishings", amount: "$2,960", status: "COMPLETED", time: "Yesterday" },
];

const ACTIVITY = [
  { label: "Waybill verified", meta: "ESC-2043 · DHL NG", time: "12m ago" },
  { label: "Dispute escalated", meta: "ESC-2045 · 78% match signal", time: "52m ago" },
  { label: "Funds locked", meta: "ESC-2046 · payment confirmation", time: "1h ago" },
];

const STATUS_STYLES: Record<string, string> = {
  AWAITING_PAYMENT: "bg-white/80 text-(--ink-muted) border border-(--border-soft)",
  FUNDS_LOCKED: "bg-(--action) text-(--action-ink)",
  IN_TRANSIT: "bg-(--accent-fog) text-(--ink-strong)",
  VERIFYING: "bg-(--surface-alt) text-(--ink-muted)",
  AWAITING_HUMAN_REVIEW: "bg-(--accent-positive)/20 text-(--accent-positive-ink)",
};

const RISK_STYLES: Record<string, string> = {
  Low: "bg-(--accent-positive)/20 text-(--accent-positive-ink)",
  Medium: "bg-(--surface-alt) text-(--ink-muted)",
  High: "bg-(--action) text-(--action-ink)",
};

const PAYOUT_STYLES: Record<string, string> = {
  COMPLETED: "bg-(--accent-positive)/20 text-(--accent-positive-ink)",
  PENDING: "bg-(--surface-alt) text-(--ink-muted)",
};

export default function DashboardPage() {
  const getStatusStyles = (status: string) => STATUS_STYLES[status] ?? "bg-(--surface-alt) text-(--ink-muted)";
  const getRiskStyles = (risk: string) => RISK_STYLES[risk] ?? "bg-(--surface-alt) text-(--ink-muted)";
  const getPayoutStyles = (status: string) => PAYOUT_STYLES[status] ?? "bg-(--surface-alt) text-(--ink-muted)";

  return (
    <main className="min-h-full">
      <div className="relative min-h-full">
        <aside className="hidden h-dvh w-[300px] flex-col border-r border-white/10 section-emerald text-(--action-ink) shadow-(--shell-shadow) lg:fixed lg:inset-y-0 lg:left-0 lg:flex">
          <div className="border-b border-white/10 px-6 pb-6 pt-7">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-xs font-semibold uppercase tracking-[0.24em] text-(--action-ink)">
                BS
              </div>
              <div>
                <p className="text-sm font-semibold text-(--action-ink)">BorderSafe</p>
                <p className="text-xs text-(--action-ink-dim)">Operations studio</p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-(--action-ink-dim)">
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1">Morning</span>
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1">13 corridors</span>
            </div>
          </div>

          <nav className="flex-1 px-6 py-6">
            <p className="px-2 text-xs uppercase tracking-[0.22em] text-(--action-ink-dim)">Navigation</p>
            <div className="mt-4 space-y-1">
              {NAV_LINKS.map((item) => {
                const isActive = item.label === "Overview";
                return (
                  <Link
                    key={item.label}
                    className={`group relative flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium text-(--action-ink-dim) transition hover:bg-white/10 hover:text-(--action-ink) ${
                      isActive ? "bg-white/15 text-(--action-ink)" : ""
                    }`}
                    href={item.href}
                  >
                    <span
                      className={`absolute left-2 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full ${
                        isActive ? "bg-(--accent-positive)" : "bg-transparent"
                      }`}
                    />
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-(--action-ink-dim) transition group-hover:text-(--action-ink) ${
                        isActive ? "bg-white/20 text-(--action-ink)" : ""
                      }`}
                    >
                      <item.Icon className="h-4 w-4" />
                    </span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="px-6 pb-6">
            <div className="rounded-[22px] border border-white/15 bg-white/10 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-(--action-ink)">
                  AO
                </div>
                <div>
                  <p className="text-sm font-semibold text-(--action-ink)">Ada Okoye</p>
                  <p className="text-xs text-(--action-ink-dim)">Risk Ops Lead</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between rounded-2xl bg-white/15 px-3 py-2 text-xs text-(--action-ink)">
                <span className="uppercase tracking-[0.2em] text-(--action-ink-dim)">Shift</span>
                <span>08:00-14:00</span>
              </div>
            </div>
          </div>
        </aside>

        <div className="min-h-full lg:pl-[300px]">
          <header className="sticky top-0 z-20 px-4 py-4 sm:px-8 lg:px-12">
            <div className="relative overflow-hidden rounded-[28px] border border-white/70 bg-white/80 p-4 shadow-(--card-shadow) backdrop-blur">
              <div className="absolute inset-0 section-mist" />
              <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-(--action) text-(--action-ink)">
                    <IconPulse className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-(--ink-soft)">Ops pulse</p>
                    <p className="text-sm font-semibold text-foreground">May 11, 2026</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-(--ink-soft)">
                    <span className="rounded-full border border-white/70 bg-white/85 px-3 py-1">Live view</span>
                    <span className="rounded-full border border-white/70 bg-white/85 px-3 py-1">24 escalations</span>
                  </div>
                </div>

                <div className="flex flex-1 items-center gap-3 sm:max-w-[420px]">
                  <div className="relative w-full">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-(--ink-soft)">
                      <IconSearch className="h-4 w-4" />
                    </span>
                    <input
                      className="w-full rounded-full border border-white/70 bg-white/85 py-2 pl-9 pr-4 text-sm text-foreground outline-none"
                      placeholder="Search escrows, buyers, sellers"
                      type="search"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/85 text-(--ink-muted)"
                    type="button"
                    aria-label="Notifications"
                  >
                    <IconBell className="h-4 w-4" />
                  </button>
                  <button
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/85 text-(--ink-muted)"
                    type="button"
                    aria-label="Insights"
                  >
                    <IconSpark className="h-4 w-4" />
                  </button>
                  <Link
                    className="rounded-full bg-(--action) px-4 py-2 text-xs font-semibold text-(--action-ink)"
                    href="/escrow/new"
                  >
                    New escrow
                  </Link>
                </div>
              </div>

              <div className="relative z-10 mt-4 flex flex-wrap gap-2 lg:hidden">
                {NAV_LINKS.slice(0, 4).map((item) => (
                  <Link
                    key={item.label}
                    className="flex items-center gap-2 rounded-full border border-white/70 bg-white/85 px-3 py-2 text-xs font-semibold text-(--ink-muted)"
                    href={item.href}
                  >
                    <item.Icon className="h-3.5 w-3.5" />
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </header>

          <div className="flex flex-col gap-8 px-4 py-8 sm:px-8 lg:px-12">
            <section className="relative overflow-hidden rounded-[36px] border border-white/70 bg-white/70 p-7 shadow-(--shell-shadow)">
              <div className="absolute inset-0 section-bridge" />
              <div className="absolute inset-0 bg-gradient-to-br from-white/85 via-white/55 to-white/15" />
              <div className="relative z-10 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h1 className="display-serif text-3xl text-foreground sm:text-4xl">Operations center</h1>
                      <p className="mt-3 max-w-[46ch] text-sm leading-6 text-(--ink-muted)">
                        Real-time oversight of escrow states, dispute risk, and payout performance across corridors.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        className="rounded-full bg-(--action) px-4 py-2 text-xs font-semibold text-(--action-ink)"
                        href="/escrow/new"
                      >
                        Start escrow
                      </Link>
                      <Link
                        className="rounded-full border border-white/70 bg-white/80 px-4 py-2 text-xs font-semibold text-foreground"
                        href="/wallet"
                      >
                        View wallet
                      </Link>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {SUMMARY.map((item) => (
                      <div key={item.label} className="rounded-2xl border border-white/70 bg-white/85 p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-xs uppercase tracking-[0.2em] text-(--ink-soft)">{item.label}</p>
                          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-white/80 text-(--ink-muted)">
                            <item.Icon className="h-4 w-4" />
                          </span>
                        </div>
                        <p className="mt-2 text-2xl font-semibold text-foreground">{item.value}</p>
                        <p className="mt-2 text-xs text-(--ink-muted)">{item.trend}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="relative rounded-[30px] border border-white/70 bg-white/85 p-4 shadow-(--card-shadow) backdrop-blur">
                    <img
                      alt="Wallet preview"
                      className="w-full rounded-[24px] object-cover"
                      src="/images/5f26813372e8df83a35831389b757450.jpg"
                    />
                    <div className="absolute left-4 top-4 rounded-full bg-(--action) px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-(--action-ink) float-slow">
                      Live
                    </div>
                    <div className="absolute -left-6 bottom-6 rounded-full border border-white/70 bg-white/95 px-3 py-2 text-xs font-semibold text-(--ink-muted) shadow-(--card-shadow) float-slower">
                      Escrow watch
                    </div>
                    <div className="absolute right-4 top-6 rounded-full border border-white/70 bg-white/95 px-3 py-2 text-xs font-semibold text-(--ink-muted) shadow-(--card-shadow) float-slow">
                      Settlement window 12m
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[22px] border border-white/70 bg-white/85 p-4 text-sm text-(--ink-muted)">
                      <p className="text-xs uppercase tracking-[0.2em] text-(--ink-soft)">Priority corridor</p>
                      <p className="mt-2 text-lg font-semibold text-foreground">NGN → USD</p>
                      <p className="mt-1 text-xs text-(--ink-soft)">Verification queue 14</p>
                    </div>
                    <div className="rounded-[22px] bg-(--action) p-4 text-sm text-(--action-ink)">
                      <p className="text-xs uppercase tracking-[0.2em] text-(--action-ink-dim)">Next release</p>
                      <p className="mt-2 text-lg font-semibold">$28,420</p>
                      <p className="mt-1 text-xs text-(--action-ink-dim)">Scheduled in 18m</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
              <div className="relative overflow-hidden rounded-[32px] border border-white/70 bg-white/75 p-6 shadow-(--card-shadow)">
                <div className="absolute inset-0 section-mist" />
                <div className="relative z-10">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">Escrow volume</h2>
                      <p className="mt-1 text-sm text-(--ink-muted)">30-day transaction flow across corridors.</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-(--ink-soft)">
                      <span className="rounded-full border border-white/70 bg-white/80 px-3 py-1">30 days</span>
                      <span className="rounded-full border border-white/70 bg-white/80 px-3 py-1">All corridors</span>
                    </div>
                  </div>
                  <div className="mt-6 rounded-[26px] bg-white/80 p-4">
                    <svg className="h-40 w-full" viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <linearGradient id="volumeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#6ea86a" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="#6ea86a" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M0,110 C30,90 60,100 90,80 C120,60 150,70 180,55 C210,40 240,60 270,35 C295,18 305,26 320,18 L320,140 L0,140 Z"
                        fill="url(#volumeGradient)"
                      />
                      <path
                        d="M0,110 C30,90 60,100 90,80 C120,60 150,70 180,55 C210,40 240,60 270,35 C295,18 305,26 320,18"
                        fill="none"
                        stroke="#1f2a1f"
                        strokeWidth="2.5"
                      />
                      <circle cx="270" cy="35" r="4" fill="#1f2a1f" />
                    </svg>
                    <div className="mt-4 flex flex-wrap items-center justify-between text-sm text-(--ink-muted)">
                      <span>Peak escrow volume on NGN to USD corridor</span>
                      <span className="text-(--ink-strong)">$148k</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-6">
                <div className="relative overflow-hidden rounded-[30px] border border-white/70 bg-white/75 p-5 shadow-(--card-shadow)">
                  <div className="absolute inset-0 section-aurora" />
                  <div className="relative z-10">
                    <h3 className="text-lg font-semibold text-foreground">Escrow health</h3>
                    <p className="mt-1 text-sm text-(--ink-muted)">Risk split by confidence level.</p>
                    <div className="mt-5 flex items-center gap-4">
                      <div
                        className="h-20 w-20 rounded-full"
                        style={{
                          background: "conic-gradient(#6ea86a 0 68%, #efe9df 68% 100%)",
                        }}
                      />
                      <div className="space-y-2 text-sm text-(--ink-muted)">
                        <p>
                          <span className="font-semibold text-foreground">68%</span> low risk
                        </p>
                        <p>
                          <span className="font-semibold text-foreground">22%</span> medium risk
                        </p>
                        <p>
                          <span className="font-semibold text-foreground">10%</span> high risk
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-[30px] p-5 text-(--action-ink) shadow-(--card-shadow)">
                  <div className="absolute inset-0 section-emerald" />
                  <div className="relative">
                    <h3 className="text-lg font-semibold">System checks</h3>
                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span>Payment confirmations</span>
                        <span className="text-(--action-ink)">Operational</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Automated review</span>
                        <span className="text-(--action-ink)">Stable</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Payout processing</span>
                        <span className="text-(--action-ink)">Processing</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-[2.1fr_1fr]">
              <div className="rounded-[32px] border border-white/70 bg-white/75 p-6 shadow-(--card-shadow) backdrop-blur">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">Active escrows</h2>
                    <p className="mt-1 text-sm text-(--ink-muted)">
                      Live view of escrow states requiring attention or verification.
                    </p>
                  </div>
                  <Link
                    className="rounded-full border border-white/70 bg-white/70 px-4 py-2 text-xs font-semibold text-foreground"
                    href="/escrow/new"
                  >
                    New escrow
                  </Link>
                </div>
                <div className="mt-5 space-y-3">
                  {ACTIVE_ESCROWS.map((escrow) => (
                    <Link
                      key={escrow.id}
                      className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-white/70 bg-white/80 px-4 py-4 shadow-(--card-shadow)"
                      href={escrow.href}
                    >
                      <div>
                        <p className="text-sm font-semibold text-foreground">{escrow.id}</p>
                        <p className="mt-1 text-sm text-(--ink-muted)">
                          {escrow.buyer} -&gt; {escrow.seller}
                        </p>
                        <p className="mt-1 text-xs text-(--ink-soft)">{escrow.corridor}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-foreground">{escrow.amount}</p>
                        <p className="mt-1 text-xs text-(--ink-soft)">{escrow.updated}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyles(escrow.status)}`}>
                        {escrow.status.replaceAll("_", " ")}
                      </span>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getRiskStyles(escrow.risk)}`}>
                        {escrow.risk} risk
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="grid gap-6">
                <section className="rounded-[30px] border border-white/70 bg-white/75 p-5 shadow-(--card-shadow) backdrop-blur">
                  <h3 className="text-lg font-semibold text-foreground">Review queue</h3>
                  <p className="mt-1 text-sm text-(--ink-muted)">Escrows awaiting human decision.</p>
                  <div className="mt-4 space-y-3">
                    {REVIEW_QUEUE.map((item) => (
                      <Link
                        key={item.id}
                        className="block rounded-[22px] border border-white/70 bg-white/80 p-4 shadow-(--card-shadow)"
                        href={item.href}
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-foreground">{item.id}</p>
                          <span className="text-xs text-(--ink-soft)">{item.updated}</span>
                        </div>
                        <p className="mt-2 text-sm text-(--ink-muted)">{item.seller}</p>
                        <p className="mt-1 text-xs text-(--ink-soft)">{item.reason}</p>
                        <p className="mt-2 text-xs font-semibold text-(--accent-positive-ink)">
                          Review signal {item.confidence}
                        </p>
                      </Link>
                    ))}
                  </div>
                </section>

                <section className="rounded-[30px] border border-white/70 bg-white/75 p-5 shadow-(--card-shadow) backdrop-blur">
                  <h3 className="text-lg font-semibold text-foreground">Live activity</h3>
                  <div className="mt-4 space-y-3">
                    {ACTIVITY.map((item) => (
                      <div key={item.label} className="rounded-[22px] bg-(--surface-alt) px-4 py-3">
                        <p className="text-sm font-semibold text-foreground">{item.label}</p>
                        <p className="text-xs text-(--ink-soft)">{item.meta}</p>
                        <p className="text-xs text-(--ink-muted)">{item.time}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
              <div className="rounded-[32px] border border-white/70 bg-white/75 p-6 shadow-(--card-shadow) backdrop-blur">
                <h2 className="text-xl font-semibold text-foreground">Recent payouts</h2>
                <p className="mt-1 text-sm text-(--ink-muted)">Latest releases executed by payout partners.</p>
                <div className="mt-5 space-y-3">
                  {PAYOUTS.map((payout) => (
                    <div
                      key={payout.id}
                      className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] bg-(--surface-alt) px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-semibold text-foreground">{payout.beneficiary}</p>
                        <p className="text-xs text-(--ink-soft)">{payout.id}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-foreground">{payout.amount}</p>
                        <p className="text-xs text-(--ink-soft)">{payout.time}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getPayoutStyles(payout.status)}`}>
                        {payout.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[32px] border border-white/70 bg-white/75 p-6 shadow-(--card-shadow) backdrop-blur">
                <h2 className="text-xl font-semibold text-foreground">Quick actions</h2>
                <div className="mt-4 grid gap-3">
                  <Link
                    className="rounded-[22px] bg-(--action) px-4 py-3 text-sm font-semibold text-(--action-ink)"
                    href="/escrow/new"
                  >
                    Create escrow
                  </Link>
                  <Link
                    className="rounded-[22px] border border-white/70 bg-white/80 px-4 py-3 text-sm font-semibold text-foreground"
                    href="/wallet"
                  >
                    Open wallet
                  </Link>
                  <Link
                    className="rounded-[22px] border border-white/70 bg-white/80 px-4 py-3 text-sm font-semibold text-foreground"
                    href="/wallet/send-money"
                  >
                    Send payout
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
