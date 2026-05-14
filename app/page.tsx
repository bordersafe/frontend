import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const navLinks = [
    { label: "Mission", href: "#mission" },
    { label: "How it works", href: "#how" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ];

  const featureCards = [
    {
      title: "Automated dispute review",
      body: "Automated checks compare seller proof to buyer receipt and return a clear decision summary.",
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

  const signalStats = [
    { value: "Locked", label: "Escrow state", note: "Funds held until proof clears" },
    { value: "Verified", label: "Review lane", note: "Escalations stay visible" },
    { value: "Settled", label: "Payout path", note: "Release happens on approval" },
    { value: "99.2%", label: "Integrity", note: "Signals matched across checks" },
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
        "Inter-state merchants, marketplace sellers, and buyers who need escrow protection without friction.",
    },
    {
      question: "What does it cost?",
      answer:
        "BorderSafe charges 1.5% per successful escrow with no setup fees or monthly contracts.",
    },
  ];

  return (
    <main className="flex min-h-full flex-col">
      <section className="relative flex min-h-dvh w-full flex-col overflow-hidden bg-white/95">
        <div className="absolute inset-0 hero-bg" />
        <div className="absolute inset-0 hero-scrim" />
        <div className="absolute inset-0 surface-grid opacity-45" />

        <header className="absolute left-0 right-0 top-0 z-15 flex flex-wrap items-center justify-between gap-4 px-4 pb-12 pt-6 sm:px-8 lg:px-12">
          <div className="flex items-center gap-3">
            <Image
              alt="BorderSafe logo"
              className="h-11 w-11 rounded-2xl object-cover"
              src="/images/logo.svg"
              width={44}
              height={44}
              priority
            />
            <p className="text-sm font-semibold text-foreground">BorderSafe</p>
          </div>

          <nav className="flex flex-wrap items-center gap-4 text-sm text-(--ink-muted)">
            {navLinks.map((item) => (
              <a
                key={item.label}
                className="transition hover:text-foreground"
                href={item.href}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              className="btn-secondary px-4 py-2 text-xs shadow-(--card-shadow)"
              href="/auth"
            >
              Auth hub
            </Link>
            <Link
              className="btn-primary px-4 py-2 text-xs shadow-(--card-shadow)"
              href="/auth/signup"
            >
              Get started
            </Link>
          </div>
        </header>

        <div className="relative z-10 flex w-full flex-1 items-center justify-center px-4 pb-12 pt-24 sm:px-8 lg:px-12">
          <div className="grid w-full max-w-5xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <h1 className="display-serif text-5xl leading-[0.98] text-foreground sm:text-6xl lg:text-7xl">
                Escrow that verifies <span className="italic">delivery</span> before money moves.
              </h1>
              <p className="mt-5 max-w-[52ch] text-sm leading-6 text-(--ink-muted)">
                BorderSafe locks funds, confirms delivery, and resolves disputes with automated
                checks plus human review. Buyers and vendors keep momentum without trading trust.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link className="btn-primary px-5 py-3 text-sm shadow-(--card-shadow)" href="/escrow/new">
                  Start an escrow
                </Link>
                <Link className="btn-secondary px-5 py-3 text-sm shadow-(--card-shadow)" href="/dashboard">
                  View product
                </Link>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[30px] border border-white/70 bg-white/80 shadow-(--card-shadow)">
              <Image
                alt="Escrow workflow preview"
                className="h-full w-full object-cover"
                src="/images/ab7733160848eba09625d20a5fc245ee.jpg"
                width={980}
                height={780}
                sizes="(max-width: 1024px) 100vw, 520px"
              />
              <div className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-(--ink-muted)">
                Verified release path
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-14 px-4 pb-16 pt-12 sm:px-8 lg:px-12">
        <section className="relative overflow-hidden rounded-[40px] p-6 shadow-(--shell-shadow)">
          <div className="absolute inset-0 section-bridge" />
          <div className="absolute inset-0 bg-linear-to-b from-white/75 via-white/45 to-white/10" />
          <div className="relative z-10 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="panel p-6">
              <h2 className="heading-2">Visual control for every corridor.</h2>
              <p className="mt-4 text-sm leading-6 text-(--ink-muted)">
                BorderSafe keeps funds locked, evidence verified, and payouts clean with a calm,
                real-time view for both buyers and sellers.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {signalStats.map((stat) => (
                  <div key={stat.label} className="panel-muted p-4 text-sm text-(--ink-muted)">
                    <p className="text-[10px] uppercase tracking-[0.26em] text-(--ink-soft)">{stat.label}</p>
                    <p className="mt-2 text-lg font-semibold text-foreground">{stat.value}</p>
                    <p className="mt-1 text-xs text-(--ink-soft)">{stat.note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[30px] border border-white/70 bg-white/80 shadow-(--card-shadow)">
              <Image
                alt="Wallet interface preview"
                className="h-full w-full object-cover"
                src="/images/ab7733160848eba09625d20a5fc245ee.jpg"
                width={720}
                height={520}
                sizes="(max-width: 1024px) 100vw, 420px"
              />
            </div>
          </div>
        </section>

        <section
          id="mission"
          className="relative overflow-hidden rounded-[36px] p-7 shadow-(--shell-shadow)"
        >
          <div className="absolute inset-0 section-aurora" />
          <div className="relative z-10 grid gap-6 lg:grid-cols-[1fr_0.95fr]">
            <div className="panel p-7">
              <h2 className="heading-2">
                Built for <span className="italic">trusted</span> inter-state trade.
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
                <article key={item.title} className="panel p-5 lift-hover">
                  <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-(--ink-muted)">{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden rounded-[36px] p-6 shadow-(--shell-shadow)">
          <div className="absolute inset-0 section-mist" />
          <div className="relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="heading-2">
                Capabilities that keep <span className="italic">trade</span> moving.
              </h2>
              <Link
                className="btn-secondary px-4 py-2 text-xs"
                href="/dashboard"
              >
                See the product
              </Link>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {featureCards.map((card) => (
                <article
                  key={card.title}
                  className="panel p-5 lift-hover"
                >
                  <h3 className="text-sm font-semibold text-foreground">{card.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-(--ink-muted)">{card.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="how"
          className="relative overflow-hidden rounded-[36px] p-6 shadow-(--shell-shadow)"
        >
          <div className="absolute inset-0 section-aurora" />
          <div className="absolute -left-16 top-10 h-40 w-40 rounded-full bg-(--accent-fog)/50 blur-3xl" />
          <div className="relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="heading-2">
                  An escrow loop built for <span className="italic">speed</span> and safety.
                </h2>
                <p className="mt-3 text-sm text-(--ink-muted)">
                  Four steps keep money safe while delivery moves quickly.
                </p>
              </div>
              <Link
                className="btn-primary px-4 py-2 text-xs"
                href="/dashboard"
              >
                Explore the flow
              </Link>
            </div>
            <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, index) => (
                <li
                  key={step.title}
                  className="panel p-5 lift-hover"
                >
                  <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.24em] text-(--ink-soft)">
                    <span>Step {String(index + 1).padStart(2, "0")}</span>
                    <span className="h-px flex-1 bg-(--border-soft)" />
                  </div>
                  <p className="mt-4 text-sm font-semibold text-foreground">{step.title}</p>
                  <p className="mt-2 text-sm leading-6 text-(--ink-muted)">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="pricing" className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative overflow-hidden rounded-4xl p-6 shadow-(--card-shadow)">
            <div className="absolute inset-0 section-mist" />
            <div className="relative">
              <h2 className="heading-2">
                Simple, <span className="italic">transparent</span> pricing.
              </h2>
              <p className="mt-4 text-sm leading-6 text-(--ink-muted)">
                BorderSafe charges 1.5% only when an escrow resolves successfully. No hidden fees, no setup
                costs, and full audit visibility for merchants and buyers.
              </p>
              <div className="mt-6 space-y-3 text-sm text-(--ink-muted)">
                <p>No setup fees or monthly contracts.</p>
                <p>Fees apply only when funds release successfully.</p>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  className="btn-primary px-4 py-2 text-xs"
                  href="/escrow/new"
                >
                  Start an escrow
                </Link>
                <Link
                  className="btn-secondary px-4 py-2 text-xs"
                  href="/auth/signup"
                >
                  Create an account
                </Link>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-4xl p-6 text-(--action-ink) shadow-(--card-shadow)">
            <div className="absolute inset-0 section-emerald" />
            <div className="relative">
              <h3 className="heading-3 text-(--action-ink)">Security controls built for real trade.</h3>
              <p className="mt-3 text-sm text-(--action-ink-dim)">
                Confirmation checks, duplicate-safe payouts, and human review keep releases controlled.
              </p>
              <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-[20px] border border-white/15 bg-white/10 p-4">
                  <p className="text-[10px] uppercase tracking-[0.26em] text-(--action-ink-dim)">Confirmation checks</p>
                  <p className="mt-2 font-semibold text-(--action-ink)">Enabled</p>
                </div>
                <div className="rounded-[20px] border border-white/15 bg-white/10 p-4">
                  <p className="text-[10px] uppercase tracking-[0.26em] text-(--action-ink-dim)">Fraud escalation</p>
                  <p className="mt-2 font-semibold text-(--action-ink)">Human review</p>
                </div>
                <div className="rounded-[20px] border border-white/15 bg-white/10 p-4 sm:col-span-2">
                  <p className="text-[10px] uppercase tracking-[0.26em] text-(--action-ink-dim)">Payout automation</p>
                  <p className="mt-2 font-semibold text-(--action-ink)">Duplicate-safe</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="faq"
          className="relative overflow-hidden rounded-[36px] p-6 shadow-(--shell-shadow)"
        >
          <div className="absolute inset-0 section-mist" />
          <div className="relative z-10">
            <h2 className="heading-2">Questions, answered.</h2>
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {faqItems.map((item) => (
                <div
                  key={item.question}
                  className="panel p-5"
                >
                  <h3 className="text-sm font-semibold text-foreground">{item.question}</h3>
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
              <h2 className="heading-1 text-(--action-ink)">
                Move money with <span className="italic">confidence</span>.
              </h2>
              <p className="mt-3 text-sm text-(--action-ink-dim)">
                Launch your first escrow today and protect every inter-state transaction end to end.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                className="btn-ghost px-5 py-3 text-sm"
                href="/escrow/new"
              >
                Start an escrow
              </Link>
              <Link
                className="btn-secondary px-5 py-3 text-sm"
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
