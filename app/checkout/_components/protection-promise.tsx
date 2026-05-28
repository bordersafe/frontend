"use client";

import Link from "next/link";

export function CheckoutProtectionPromise() {
  return (
    <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
      <h3 className="font-semibold text-emerald-900">✓ Buyer Protection Guarantee</h3>
      <ul className="mt-3 space-y-2 text-sm text-emerald-800">
        <li>
          <strong>Funds Locked:</strong> Your payment is held securely until you confirm delivery.
        </li>
        <li>
          <strong>Delivery Tracking:</strong> Real-time updates on shipment status and location.
        </li>
        <li>
          <strong>48-Hour Dispute SLA:</strong> If goods don't match, we resolve disputes within 24 hours.
        </li>
        <li>
          <strong>Full Refund:</strong> If you dispute, your money is refunded to your wallet or bank instantly.
        </li>
      </ul>
      <Link
        href="/trust-center"
        className="mt-3 inline-block text-xs font-semibold text-emerald-900 underline hover:text-emerald-700"
      >
        Learn how this works →
      </Link>
    </section>
  );
}
