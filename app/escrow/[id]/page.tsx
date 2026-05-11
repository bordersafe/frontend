interface EscrowDetailPageProps {
  params: { id: string };
}

export default function EscrowDetailPage({ params }: EscrowDetailPageProps) {
  const { id } = params;

  return (
    <main className="flex min-h-full flex-col gap-5 px-4 py-6 sm:px-8 lg:px-10">
      <h1 className="text-2xl font-semibold text-foreground">Escrow {id}</h1>
      <p className="text-sm text-(--ink-muted)">
        Route skeleton for FE-011, FE-012, FE-020, and FE-030 branches.
      </p>
      <section className="rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-(--card-shadow) backdrop-blur">
        <p className="text-sm text-(--ink-muted)">
          Placeholder: immutable timeline, legal next actions, arbitration result panel.
        </p>
      </section>
    </main>
  );
}
