import Link from "next/link";

export default function Home() {
  const navLinks = [
    { label: "Mission", href: "#mission" },
    { label: "How it works", href: "#how" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ];

  const featureCards = [
    {
      title: "Dispute decisioning",
      body: "We compare seller proof to buyer receipt and return a clear decision summary.",
    },
    {
      title: "Protected payouts",
      body: "Checkout, payment confirmation, and guarded releases keep funds safe end to end.",
    },
    {
      title: "Immutable timelines",
      body: "Every state change is logged for audit-ready escrow history.",
    },
    {
      title: "Human override",
      body: "Ambiguous cases route to a manual reviewer without blocking the happy path.",
    },
  ];

  const steps = [
    {
      title: "Create escrow",
      body: "Seller submits trade details and a baseline product image.",
    },
    {
      title: "Lock funds",
      body: "Buyer pays through checkout; confirmation locks funds.",
    },
    {
      title: "Verify delivery",
      body: "Delivery proof and buyer evidence trigger automated verification.",
    },
    {
      title: "Release or review",
      body: "Clear matches pay out instantly; otherwise, human review steps in.",
    },
  ];

  const outcomes = [
    {
      title: "Locked funds, verified release",
      body: "Funds stay protected until delivery evidence confirms the trade.",
    },
    {
      title: "Evidence-led dispute handling",
      body: "We compare product proofs; ambiguous cases route to review.",
    },
    {
      title: "Transparent audit history",
      body: "Every action is logged in a timeline shared with buyers and sellers.",
    },
  ];

  const faqItems = [
    {
      question: "How does BorderSafe decide a dispute?",
      answer:
        "We compare seller and buyer evidence. If the outcome is unclear, a human reviewer resolves it.",
    },
    {
      question: "When do payouts happen?",
      answer:
        "Payouts trigger only after verification or manual approval and include duplicate protection.",
    },
    {
      question: "Who is BorderSafe built for?",
      answer:
        "Cross-border merchants, marketplace sellers, and buyers who need escrow protection without friction.",
    },
    {
      question: "What does it cost?",
      answer:
        "BorderSafe charges 1.5% per successful escrow with no setup fees or monthly contracts.",
    },
  ];

  const signalStats = [
    { value: "$4.8M", label: "Funds protected", note: "last 30 days" },
    { value: "2.4 min", label: "Median lock time", note: "Payment confirmed" },
    { value: "95.4%", label: "Auto-resolved", note: "Automated checks" },
  ];

  const trustBadges = [
    "Payment confirmed",
    "Escrow holds",
    "Human review ready",
  ];

  return (
    <main className="flex min-h-full flex-col">
      <section className="relative w-full h-dvh flex flex-col items-center justify-center overflow-hidden bg-white/95">
        <div className="absolute inset-0 hero-bg" />
        <div className="absolute inset-0 hero-scrim" />

        <header className="absolute top-0 left-0 right-0 flex flex-wrap items-center justify-between gap-4 z-15 px-4 pb-12 pt-6 sm:px-8 lg:px-12">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-(--action) text-xs font-semibold uppercase tracking-[0.28em] text-(--action-ink)">
              BS
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.34em] text-(--ink-soft)">
                BorderSafe
              </p>
              <p className="text-sm text-(--ink-muted)">
                Protected escrow for cross-border trade
              </p>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-4 text-sm text-(--ink-muted)">
            {navLinks.map((item) => (
              <a
                key={item.label}
                className="transition hover:text-(--ink-strong)"
                href={item.href}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              className="rounded-full border border-white/70 bg-white/70 px-4 py-2 text-xs font-semibold text-foreground shadow-(--card-shadow) backdrop-blur"
              href="/auth/login"
            >
              Login
            </Link>
            <Link
              className="rounded-full bg-(--action) px-4 py-2 text-xs font-semibold text-(--action-ink) shadow-(--card-shadow)"
              href="/auth/signup"
            >
              Get started
            </Link>
          </div>
        </header>

        <div className="relative w-full z-10 flex items-center justify-center pb-12 md:pb-12">
          <div className="max-w-[650px] flex flex-col items-center justify-center">
            <h1 className="display-serif mt-2 text-4xl leading-[1.04] text-foreground sm:text-5xl lg:text-6xl text-center">
              Escrow that verifies <span className="italic">delivery</span>{" "}
              before funds release.
            </h1>
            <p className="mt-5 max-w-[45ch] text-sm leading-6 text-(--ink-muted) text-center sm:text-base">
              BorderSafe secures cross-border trade by locking funds, confirming
              delivery, and resolving disputes with automated checks and human review.
              Buyers and vendors get certainty without slowing commerce.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                className="rounded-full bg-(--action) px-5 py-3 text-sm font-semibold text-(--action-ink) shadow-(--card-shadow)"
                href="/escrow/new"
              >
                Start an escrow
              </Link>
              <Link
                className="rounded-full border border-white/70 bg-white/70 px-5 py-3 text-sm font-semibold text-foreground shadow-(--card-shadow) backdrop-blur"
                href="/dashboard"
              >
                View product
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap gap-4 text-xs text-(--ink-soft)">
              <span>Trusted checkout + payouts</span>
              <span>Delivery proof + visual checks</span>
              <span>Audit-ready timelines</span>
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-14 px-4 pb-16 pt-12 sm:px-8 lg:px-12">
        <section className="relative overflow-hidden rounded-[40px] border border-white/70 bg-white/70 p-6 shadow-(--shell-shadow) backdrop-blur">
          <div className="absolute inset-0 section-bridge" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/75 via-white/45 to-white/10" />
          <div className="relative z-10 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[30px] border border-white/70 bg-white/80 p-6 shadow-(--card-shadow) backdrop-blur">
              <p className="text-xs uppercase tracking-[0.26em] text-(--ink-soft)">Live escrow signal</p>
              <h2 className="display-serif mt-3 text-3xl text-foreground sm:text-4xl">
                Visual control for every corridor.
              </h2>
              <p className="mt-4 text-sm leading-6 text-(--ink-muted)">
                BorderSafe keeps funds locked, evidence verified, and payouts clean with a calm,
                real-time view for both buyers and sellers.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {trustBadges.map((badge) => (
                  <span
                    key={badge}
                    className="rounded-full border border-white/70 bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-(--ink-muted)"
                  >
                    {badge}
                  </span>
                ))}
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {signalStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-[20px] border border-white/70 bg-white/85 p-4 text-sm text-(--ink-muted)"
                  >
                    <p className="text-xs uppercase tracking-[0.2em] text-(--ink-soft)">{stat.label}</p>
                    <p className="mt-2 text-2xl font-semibold text-foreground">{stat.value}</p>
                    <p className="mt-1 text-xs text-(--ink-soft)">{stat.note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="relative w-full max-w-[360px]">
                <div className="rounded-[34px] border border-white/70 bg-white/85 p-4 shadow-(--card-shadow) backdrop-blur">
                  <img
                    alt="Wallet interface preview"
                    className="w-full rounded-[26px] object-cover"
                    src="/images/ab7733160848eba09625d20a5fc245ee.jpg"
                  />
                </div>
                <div className="absolute -left-8 top-10 rounded-full border border-white/70 bg-white/90 px-3 py-2 text-xs font-semibold text-(--ink-muted) shadow-(--card-shadow) float-slow">
                  Funds locked
                </div>
                <div className="absolute -right-6 bottom-8 rounded-full border border-white/70 bg-white/90 px-3 py-2 text-xs font-semibold text-(--ink-muted) shadow-(--card-shadow) float-slower">
                  Delivery verified
                </div>
                <div className="absolute right-10 top-4 rounded-full bg-(--action) px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-(--action-ink) float-slow">
                  Live
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="mission"
          className="relative overflow-hidden rounded-[36px] border border-white/70 bg-white/70 p-7 shadow-(--shell-shadow)"
        >
          <div className="absolute inset-0 section-aurora" />
          <div className="relative z-10 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[32px] border border-white/70 bg-white/80 p-7 shadow-(--card-shadow) backdrop-blur">
              <h2 className="display-serif text-3xl text-foreground sm:text-4xl">
                Built for <span className="italic">trusted</span> cross-border trade.
              </h2>
              <p className="mt-4 text-sm leading-6 text-(--ink-muted)">
                BorderSafe protects merchants who trade on WhatsApp, Instagram, and marketplaces by
                locking funds, verifying delivery, and resolving disputes with oversight.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-(--ink-muted)">
                <li className="flex items-start gap-3">
                  <span className="mt-2 h-2 w-2 rounded-full bg-(--accent-positive)" />
                  <span>Funds are released only when proof meets agreed conditions.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-2 h-2 w-2 rounded-full bg-(--accent-positive)" />
                  <span>Merchants and buyers see the same audit trail in real time.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-2 h-2 w-2 rounded-full bg-(--accent-positive)" />
                  <span>Disputes resolve faster with automated triage and human arbitration.</span>
                </li>
              </ul>
            </div>

            <div className="grid gap-4">
              {outcomes.map((item) => (
                <article
                  key={item.title}
                  className="rounded-[26px] border border-white/70 bg-white/80 p-5 shadow-(--card-shadow) backdrop-blur"
                >
                  <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-(--ink-muted)">{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden rounded-[36px] border border-white/70 bg-white/70 p-6 shadow-(--shell-shadow)">
          <div className="absolute inset-0 section-mist" />
          <div className="pointer-events-none absolute -right-24 -top-32 h-[360px] w-[360px] opacity-70">
            <img
              alt=""
              className="h-full w-full object-cover"
              src="/images/cbac35ee865f0da5885dd647c7d012ac.jpg"
            />
          </div>
          <div className="relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="display-serif text-3xl text-foreground sm:text-4xl">
                Capabilities that keep <span className="italic">trade</span> moving.
              </h2>
              <Link
                className="rounded-full border border-white/70 bg-white/80 px-4 py-2 text-xs font-semibold text-foreground"
                href="/dashboard"
              >
                See the product
              </Link>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {featureCards.map((card) => (
                <article
                  key={card.title}
                  className="rounded-[26px] border border-white/70 bg-white/85 p-5 shadow-(--card-shadow) backdrop-blur"
                >
                  <h3 className="text-base font-semibold text-foreground">{card.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-(--ink-muted)">{card.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="how"
          className="relative overflow-hidden rounded-[36px] border border-white/70 bg-white/70 p-6 shadow-(--shell-shadow)"
        >
          <div className="absolute inset-0 section-aurora" />
          <div className="absolute -left-16 top-10 h-40 w-40 rounded-full bg-(--accent-fog)/50 blur-3xl" />
          <div className="relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="display-serif text-3xl text-foreground sm:text-4xl">
                  An escrow loop built for <span className="italic">speed</span> and safety.
                </h2>
                <p className="mt-3 text-sm text-(--ink-muted)">
                  Four steps keep money safe while delivery moves quickly.
                </p>
              </div>
              <Link
                className="rounded-full bg-(--action) px-4 py-2 text-xs font-semibold text-(--action-ink)"
                href="/dashboard"
              >
                Explore the flow
              </Link>
            </div>
            <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, index) => (
                <li
                  key={step.title}
                  className="rounded-[26px] border border-white/70 bg-white/85 p-5 shadow-(--card-shadow) backdrop-blur"
                >
                  <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-(--ink-soft)">
                    <span className="rounded-full bg-(--action) px-3 py-1 text-[10px] font-semibold text-(--action-ink)">
                      Step {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="h-px flex-1 bg-(--border-soft)" />
                  </div>
                  <p className="mt-4 text-base font-semibold text-foreground">{step.title}</p>
                  <p className="mt-2 text-sm leading-6 text-(--ink-muted)">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="pricing" className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative overflow-hidden rounded-[32px] border border-white/70 bg-white/75 p-6 shadow-(--card-shadow)">
            <div className="absolute inset-0 section-mist" />
            <div className="relative">
              <h2 className="display-serif text-3xl text-foreground sm:text-4xl">
                Simple, <span className="italic">transparent</span> pricing.
              </h2>
              <p className="mt-4 text-sm leading-6 text-(--ink-muted)">
                BorderSafe charges 1.5% only when an escrow resolves successfully. No hidden fees, no setup
                costs, and full audit visibility for merchants and buyers.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/85 p-4 text-sm text-(--ink-muted)">
                  No setup fees or monthly contracts.
                </div>
                <div className="rounded-2xl bg-white/85 p-4 text-sm text-(--ink-muted)">
                  Fees apply only when funds release successfully.
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  className="rounded-full bg-(--action) px-4 py-2 text-xs font-semibold text-(--action-ink)"
                  href="/escrow/new"
                >
                  Start an escrow
                </Link>
                <Link
                  className="rounded-full border border-white/70 bg-white/80 px-4 py-2 text-xs font-semibold text-foreground"
                  href="/auth/signup"
                >
                  Create an account
                </Link>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[32px] p-6 text-(--action-ink) shadow-(--card-shadow)">
            <div className="absolute inset-0 section-emerald" />
            <div className="relative">
              <h3 className="text-2xl font-semibold">Security controls built for real trade.</h3>
              <p className="mt-3 text-sm text-(--action-ink-dim)">
                Payment confirmation checks, duplicate-safe payouts, and a human review queue keep funds protected at scale.
              </p>
              <div className="mt-5 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span>Payment confirmation checks</span>
                  <span className="text-(--action-ink)">Enabled</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Fraud escalation</span>
                  <span className="text-(--action-ink)">Human review</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Payout automation</span>
                  <span className="text-(--action-ink)">Duplicate-safe</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="faq"
          className="relative overflow-hidden rounded-[36px] border border-white/70 bg-white/70 p-6 shadow-(--shell-shadow)"
        >
          <div className="absolute inset-0 section-mist" />
          <div className="relative z-10">
            <h2 className="display-serif text-3xl text-foreground sm:text-4xl">
              Questions, answered.
            </h2>
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {faqItems.map((item) => (
                <div
                  key={item.question}
                  className="rounded-[26px] border border-white/70 bg-white/85 p-5 shadow-(--card-shadow)"
                >
                  <h3 className="text-base font-semibold text-foreground">{item.question}</h3>
                  <p className="mt-2 text-sm leading-6 text-(--ink-muted)">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden rounded-[36px] p-8 text-(--action-ink) shadow-(--shell-shadow)">
          <div className="absolute inset-0 section-emerald" />
          <div className="relative flex flex-wrap items-center justify-between gap-6">
            <div>
              <h2 className="display-serif text-3xl sm:text-4xl">
                Move money with <span className="italic">confidence</span>.
              </h2>
              <p className="mt-3 text-sm text-(--action-ink-dim)">
                Launch your first escrow today and protect every cross-border transaction end to end.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                className="rounded-full bg-white/10 px-5 py-3 text-sm font-semibold text-(--action-ink)"
                href="/escrow/new"
              >
                Start an escrow
              </Link>
              <Link
                className="rounded-full border border-white/60 bg-white/85 px-5 py-3 text-sm font-semibold text-foreground"
                href="/auth/signup"
              >
                Create account
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
