import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-full flex-col overflow-hidden">
      {/* ── Public Top Bar ────────────────────────────────────── */}
      <header className="fixed top-0 w-full z-50 flex items-center justify-between px-6 py-4 sm:px-10 border-b border-(--border-soft) bg-(--surface)/70 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-(--action) shadow-lg shadow-(--action)/20">
            <svg className="h-5 w-5 text-(--action-ink)" fill="none" viewBox="0 0 24 24">
              <path d="M12 2L4 7v5c0 5.5 3.5 10.74 8 12 4.5-1.26 8-6.5 8-12V7l-8-5Z" fill="currentColor" fillOpacity=".2" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-base font-bold tracking-tight text-foreground">VendOpay</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="px-4 py-2 text-sm font-medium text-(--ink-muted) hover:text-foreground transition-colors">Sign in</Link>
          <Link href="/auth/signup" className="relative overflow-hidden rounded-full bg-(--primary) px-5 py-2 text-sm font-semibold text-white transition-transform hover:scale-105 hover:shadow-lg hover:shadow-(--primary)/30">
            <span className="relative z-10">Get started</span>
          </Link>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center text-center px-6 pt-32 pb-20 sm:pt-40 sm:pb-28">
        <div className="relative z-10 mx-auto max-w-4xl reveal-up">
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-foreground mb-6 leading-tight display-serif">
            Secure Inter-State Trade<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-(--primary) to-(--accent-sky)">
              in Nigeria.
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-(--ink-muted) max-w-2xl mx-auto mb-10">
            VendOpay locks buyer funds, tracks delivery, and uses Gemini AI to detect fraud. Resolving disputes in hours, not weeks.
          </p>
          
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/auth/seller/signup" className="group relative overflow-hidden rounded-full bg-(--action) px-8 py-4 text-sm font-bold text-white shadow-xl shadow-(--action)/10 transition-transform hover:-translate-y-1 hover:shadow-(--action)/20">
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="relative z-10">Start Selling Securely</span>
            </Link>
            <Link href="/auth/buyer/signup" className="rounded-full border border-(--border-soft) bg-white/40 px-8 py-4 text-sm font-bold text-foreground backdrop-blur-md transition-all hover:bg-white/80 hover:border-(--border)">
              Buy with Confidence
            </Link>
          </div>
        </div>
      </section>

      {/* ── Bento Grid Section ────────────────────────────────── */}
      <section className="relative z-10 px-6 pb-24 sm:px-10 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[240px]">
          
          {/* Trust Stats Bento */}
          <div className="md:col-span-2 lg:col-span-2 row-span-1 rounded-3xl border border-(--border-soft) bg-white/50 backdrop-blur-xl p-8 flex flex-col justify-center overflow-hidden relative group hover:bg-white/80 transition-colors duration-500 shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-(--accent-warm)/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <h3 className="text-(--ink-soft) text-sm font-semibold mb-2 tracking-widest uppercase">Platform Trust</h3>
            <div className="flex items-end gap-6">
              <div>
                <p className="text-4xl font-bold text-foreground">₦2.4B+</p>
                <p className="text-sm text-(--ink-muted) mt-1">Funds Protected</p>
              </div>
              <div className="w-px h-12 bg-(--border-soft)" />
              <div>
                <p className="text-4xl font-bold text-(--success)">99.2%</p>
                <p className="text-sm text-(--ink-muted) mt-1">Resolution Rate</p>
              </div>
            </div>
          </div>

          {/* AI Feature Bento */}
          <div className="md:col-span-1 lg:col-span-2 row-span-2 rounded-3xl border border-(--primary-soft) bg-gradient-to-br from-(--surface-elevated) to-(--primary-soft) backdrop-blur-xl p-8 relative overflow-hidden group hover:border-(--primary)/30 transition-colors duration-500 shadow-sm">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-(--primary)/10 blur-[80px] rounded-full group-hover:bg-(--primary)/20 transition-colors duration-500" />
            <div className="relative z-10 h-full flex flex-col">
              <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-2xl mb-6 shadow-sm border border-(--border-soft)">🤖</div>
              <h2 className="text-2xl font-bold text-foreground mb-3 display-serif">AI-Powered Adjudication</h2>
              <p className="text-(--ink-muted) text-sm leading-relaxed mb-6 flex-1">
                Our Gemini multimodal AI analyzes chat histories and delivery waybills to automatically detect fraud. Disputes that used to take weeks are now resolved with pinpoint accuracy in under 24 hours.
              </p>
              <div className="flex items-center gap-2 text-(--primary) text-sm font-bold group-hover:translate-x-2 transition-transform duration-300">
                24h Dispute SLA <span className="text-lg">→</span>
              </div>
            </div>
          </div>

          {/* 100% Protection Bento */}
          <div className="md:col-span-1 lg:col-span-1 row-span-1 rounded-3xl border border-(--success-soft) bg-white/50 backdrop-blur-xl p-8 relative overflow-hidden group hover:bg-(--success-soft) transition-colors duration-500 shadow-sm">
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-(--success)/10 blur-[60px] rounded-full" />
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="h-10 w-10 rounded-full bg-(--success)/10 flex items-center justify-center text-(--success) border border-(--success)/20">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Zero Risk</h3>
                <p className="text-xs text-(--ink-muted) mt-1">Full money-back guarantee.</p>
              </div>
            </div>
          </div>

          {/* Squad Integration Bento */}
          <div className="md:col-span-1 lg:col-span-1 row-span-1 rounded-3xl border border-(--warning-soft) bg-white/50 backdrop-blur-xl p-8 relative overflow-hidden group hover:bg-(--warning-soft) transition-colors duration-500 shadow-sm">
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-(--warning)/10 flex items-center justify-center text-(--warning) border border-(--warning)/20 text-xl">💳</div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Squad Checkouts</h3>
                <p className="text-xs text-(--ink-muted) mt-1">Seamless instant payouts.</p>
              </div>
            </div>
          </div>

          {/* Lifecycle Bento */}
          <div className="md:col-span-3 lg:col-span-4 row-span-1 rounded-3xl border border-(--border-soft) bg-white/60 backdrop-blur-2xl p-8 overflow-hidden relative shadow-sm hover:bg-white/90 transition-colors duration-500">
            <h3 className="text-(--ink-soft) text-sm font-semibold mb-6 tracking-widest uppercase">The VendOpay Lifecycle</h3>
            <div className="flex items-center justify-between w-full overflow-x-auto pb-4 hide-scrollbar">
              {[
                { title: "Create", desc: "Seller sets terms", icon: "🏪" },
                { title: "Lock", desc: "Buyer pays via Squad", icon: "🔒" },
                { title: "Ship", desc: "Goods in transit", icon: "📦" },
                { title: "Verify", desc: "AI checks proof", icon: "🤖" },
                { title: "Settle", desc: "Funds disbursed", icon: "✅" },
              ].map((step, i, arr) => (
                <div key={step.title} className="flex items-center">
                  <div className="flex flex-col items-center gap-3 min-w-[100px] group">
                    <div className="h-14 w-14 rounded-2xl bg-white border border-(--border-soft) flex items-center justify-center text-2xl group-hover:scale-110 group-hover:border-(--primary) transition-all duration-300 shadow-sm">
                      {step.icon}
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-foreground">{step.title}</p>
                      <p className="text-[10px] text-(--ink-muted) mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                  {i < arr.length - 1 && (
                    <div className="hidden md:block w-16 lg:w-32 h-[1px] bg-(--border-soft) mx-2 -translate-y-4 relative">
                      <div className="absolute top-0 left-0 h-full bg-(--primary) w-0 group-hover:w-full transition-all duration-700" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="px-6 py-8 sm:px-10 border-t border-(--border-soft) bg-(--surface)/50">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-(--action)">
              <svg className="h-3.5 w-3.5 text-(--action-ink)" fill="none" viewBox="0 0 24 24">
                <path d="M12 2L4 7v5c0 5.5 3.5 10.74 8 12 4.5-1.26 8-6.5 8-12V7l-8-5Z" fill="currentColor" fillOpacity=".2" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-foreground">VendOpay</span>
          </div>
          <p className="text-xs text-(--ink-muted)">Secure inter-state escrow for Nigerian businesses. © {new Date().getFullYear()}</p>
          <div className="flex gap-6">
            <Link href="/trust-center" className="text-xs text-(--ink-muted) hover:text-foreground transition-colors">Trust Center</Link>
            <Link href="/auth/admin" className="text-xs text-(--ink-muted) hover:text-foreground transition-colors">Admin Hub</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
