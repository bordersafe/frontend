export default function CardlessPage() {
  return (
    <main className="flex min-h-full flex-col gap-5 px-4 py-6 sm:px-8 lg:px-10">
      <h1 className="text-2xl font-semibold text-foreground">Cardless Paycode</h1>
      <p className="text-sm text-(--ink-muted)">Route skeleton for FE-051.</p>
      <section className="rounded-[28px] border border-dashed border-(--border-soft) bg-white/75 p-5 text-sm text-(--ink-muted)">
        Placeholder: paycode generation flow with explicit confirmation and expiry details.
      </section>
    </main>
  );
}
