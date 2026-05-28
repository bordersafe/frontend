"use client";

import Link from "next/link";
import { useState } from "react";

type FaqItem = {
  question: string;
  answer: string;
};

const faqItems: FaqItem[] = [
  {
    question: "What happens to my money when I order?",
    answer:
      "Your payment is locked in escrow immediately upon order. This means the funds are held securely and not released to the seller until you confirm delivery. Your money is 100% protected—if you don't receive the goods or they don't match the description, you can dispute and get a full refund.",
  },
  {
    question: "How long does delivery usually take?",
    answer:
      "Inter-state delivery typically takes 3–7 business days depending on origin and destination. The seller provides an estimated delivery date at checkout. If delivery is delayed beyond 7 days without an update, you're eligible for automatic dispute assistance.",
  },
  {
    question: "What if the seller delays shipment?",
    answer:
      "If the seller doesn't ship within 3 business days or loses contact, the order escalates to our support team. After 7 days without shipping confirmation, you can open a dispute and request a refund. No need to wait—our team will investigate and issue a refund if the seller is unresponsive.",
  },
  {
    question: "What if the goods arrive damaged or don't match the listing?",
    answer:
      "Open a dispute within 48 hours of delivery with photo/video evidence. Our AI system analyzes the evidence and compares it against the original product listing. In most cases, we issue a refund or replacement decision within 24 hours. If the seller responds with proof, we escalate to a human reviewer for final decision.",
  },
  {
    question: "How long does dispute resolution take?",
    answer:
      "We aim to resolve disputes within 24–48 hours. Our AI reviews evidence first; if needed, our team provides a human decision within 2 business days. You'll receive real-time status updates and can track the dispute progress in your order timeline.",
  },
  {
    question: "What's the refund process?",
    answer:
      "If a dispute is decided in your favor, the seller's escrowed funds are released back to your wallet account immediately. Refunds to your original bank account take 1–3 business days depending on your bank. You can request to keep funds in your BorderSafe wallet for faster future purchases.",
  },
  {
    question: "How do I know if a seller is trustworthy?",
    answer:
      "All sellers have a public profile showing: verified seller badge (KYC passed), average buyer rating (1–5 stars), response rate to disputes, and recent reviews. We update these metrics in real time based on transaction history. Avoid sellers with low ratings or high dispute rates.",
  },
  {
    question: "Can I cancel my order?",
    answer:
      "Yes, up to 3 hours after placing an order (before the seller ships). After shipping, you can still open a dispute if goods are delayed or defective. Contact us at support@bordersafe.ng or use the Help section in your order timeline.",
  },
];

const slaItems = [
  { label: "Seller must ship within:", value: "3 business days" },
  { label: "Typical delivery timeframe:", value: "3–7 business days" },
  { label: "You must confirm delivery within:", value: "48 hours of arrival" },
  { label: "Dispute review & decision:", value: "24–48 hours (AI + human)" },
  { label: "Refund processing:", value: "Instant to wallet, 1–3 days to bank" },
  { label: "Auto-escalation if seller unresponsive:", value: "24 hours" },
];

const TIMELINE_STEPS = [
  {
    icon: "🔒",
    title: "You place an order",
    body: "Your payment is immediately locked in escrow. The seller cannot touch it until you confirm delivery.",
  },
  {
    icon: "📦",
    title: "Seller ships within 3 days",
    body: "We send shipping updates and track delivery. If no update after 3 days, we flag the order.",
  },
  {
    icon: "🚚",
    title: "Goods arrive (3–7 days typical)",
    body: "Confirm delivery in the app within 48 hours. If goods don't match, open a dispute instead.",
  },
  {
    icon: "✅",
    title: "Payment released or disputed",
    body: "If you confirm: seller gets paid. If you dispute: we investigate and refund you within 24–48 hours.",
  },
];

const PROMISES = [
  {
    icon: "✓",
    title: "100% Money-Back Guarantee:",
    body: "If goods don't arrive or don't match, get a full refund within 48 hours.",
  },
  {
    icon: "⏱️",
    title: "24-Hour Dispute SLA:",
    body: "We review and decide disputes within 24 hours using AI evidence analysis.",
  },
  {
    icon: "🚨",
    title: "Auto-Escalation:",
    body: "If a seller doesn't respond in 24 hours or doesn't ship in 3 days, we auto-escalate to support.",
  },
  {
    icon: "📱",
    title: "Real-Time Updates:",
    body: "Track every step: payment locked, shipped, in transit, delivered, dispute status.",
  },
];

export default function BuyerTrustCenterPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <main className="flex min-h-full flex-col gap-6 px-4 py-8 sm:px-8 lg:px-10">
      {/* Hero */}
      <header className="panel reveal-up relative overflow-hidden rounded-4xl p-8 text-center">
        <div className="section-aurora absolute inset-0" />
        <div className="relative">
          <div className="float-slow mb-4 text-5xl">🛡️</div>
          <h1 className="heading-1">Buyer Trust Center</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-(--ink-muted)">
            Your complete guide to safe purchasing, escrow protection, and dispute resolution. We protect your purchase from start to finish.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/escrow/new" className="btn-primary px-5 py-2.5 text-sm">
              Create an escrow
            </Link>
            <a href="mailto:support@bordersafe.ng" className="btn-secondary px-5 py-2.5 text-sm">
              Contact support
            </a>
          </div>
        </div>
      </header>

      {/* Protection Promise */}
      <section className="reveal-up delay-80">
        <div className="grid gap-4 sm:grid-cols-2">
          {PROMISES.map((p, i) => (
            <div key={i} className="panel p-5 flex gap-4 items-start border-l-4 border-(--success)">
              <span className="text-2xl flex-shrink-0">{p.icon}</span>
              <div>
                <p className="font-bold text-sm text-foreground">{p.title}</p>
                <p className="mt-1 text-xs text-(--ink-muted)">{p.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="panel p-6 reveal-up delay-160">
        <div className="space-y-0">
          {TIMELINE_STEPS.map((step, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-(--action) text-(--action-ink) text-xl shadow-sm flex-shrink-0">
                  {step.icon}
                </div>
                {i < TIMELINE_STEPS.length - 1 && (
                  <div className="my-1 h-8 w-0.5 bg-(--border-soft)" />
                )}
              </div>
              <div className="pb-6 pt-1.5">
                <p className="font-bold text-sm text-foreground">{step.title}</p>
                <p className="mt-1 text-sm text-(--ink-muted)">{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SLA Table */}
      <section className="panel p-6 reveal-up delay-240">
        <div className="divide-y divide-(--border-soft)">
          {slaItems.map((item, i) => (
            <div key={i} className="flex items-center justify-between py-3 text-sm">
              <span className="text-(--ink-muted)">{item.label}</span>
              <span className="font-bold text-foreground">{item.value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="reveal-up delay-240">
        <div className="space-y-2">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className={`panel overflow-hidden transition-all ${
                openIndex === index ? "border-(--action) shadow-sm" : ""
              }`}
            >
              <button
                type="button"
                className="flex w-full items-start justify-between gap-4 p-5 text-left"
                onClick={() => setOpenIndex(index === openIndex ? null : index)}
              >
                <span className="font-semibold text-sm text-foreground">{item.question}</span>
                <span className={`flex-shrink-0 text-(--ink-soft) transition-transform ${openIndex === index ? "rotate-45" : ""}`}>+</span>
              </button>
              {openIndex === index && (
                <div className="border-t border-(--border-soft) px-5 pb-5 pt-4">
                  <p className="text-sm text-(--ink-muted) leading-relaxed">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Support CTA */}
      <section className="panel p-6 text-center reveal-up delay-320">
        <p className="text-2xl mb-3">💬</p>
        <h2 className="text-base font-bold text-foreground">Still have questions?</h2>
        <p className="mt-2 text-sm text-(--ink-muted)">
          Our support team is here to help 24/7. Reach out with any concern about your order or protection.
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <a href="mailto:support@bordersafe.ng" className="btn-secondary inline-block px-5 py-2.5 text-sm">
            Email support
          </a>
          <Link href="/escrow" className="btn-primary inline-block px-5 py-2.5 text-sm">
            View your orders
          </Link>
        </div>
      </section>
    </main>
  );
}
