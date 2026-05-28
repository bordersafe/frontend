"use client";

type RefundInfo = {
  amount: number;
  issued_at: string;
};

export function RefundStatus({ refund }: { refund?: RefundInfo | null }) {
  if (!refund) {
    return null;
  }

  const issuedDate = new Date(refund.issued_at);
  const issuedFormatted = issuedDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <section className="panel relative overflow-hidden border-l-4 border-l-green-500 bg-green-50 p-5">
      <div className="absolute inset-0 -right-20 -top-20 h-40 w-40 rounded-full bg-green-100 opacity-20 blur-3xl" />
      <div className="relative">
        <h2 className="heading-3 flex items-center gap-2 text-green-900">
          <span>✓</span> Refund Approved
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-white/50 px-4 py-3 text-sm">

            <p className="mt-1 text-lg font-semibold text-foreground">
              {refund.amount.toFixed(2)}
            </p>
          </div>
          <div className="rounded-lg bg-white/50 px-4 py-3 text-sm">

            <p className="mt-1 font-medium text-foreground">{issuedFormatted}</p>
          </div>
          <div className="rounded-lg bg-white/50 px-4 py-3 text-sm">

            <p className="mt-1 font-medium text-green-700">Processing</p>
          </div>
        </div>
        <p className="mt-3 text-sm text-green-800">
          Your refund has been approved and is being processed. It should reach your account within 1-3 business days.
        </p>
      </div>
    </section>
  );
}
