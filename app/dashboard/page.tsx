"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { type ReactElement } from "react";
import useSWR from "swr";

import { normalizeApiError } from "@/lib/api";
import { useAuthedApi } from "@/lib/api/auth-client";
import type { UiError } from "@/lib/api";
type IconProps = { className?: string };
type IconComponent = (props: IconProps) => ReactElement;

type EscrowItem = {
  id: string;
  amount: number;
  currency: string;
  buyer_email: string;
  status: string;
  description: string | null;
  updated_at: string | null;
};

type EscrowListResponse = {
  count: number;
  items: EscrowItem[];
};

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

const STATUS_STYLES: Record<string, string> = {
  AWAITING_PAYMENT: "bg-white/80 text-(--ink-muted) border border-(--border-soft)",
  FUNDS_LOCKED: "bg-(--action) text-(--action-ink)",
  IN_TRANSIT: "bg-(--accent-fog) text-(--ink-strong)",
  VERIFYING: "bg-(--surface-alt) text-(--ink-muted)",
  AWAITING_HUMAN_REVIEW: "bg-(--accent-positive)/20 text-(--accent-positive-ink)",
};

const LIST_VARIANTS = {
  hidden: { opacity: 1 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const { user, profile, isAuthLoading, get } = useAuthedApi();
  const isAdmin = profile?.roles?.includes("admin") || profile?.roles?.includes("hitl");
  const isSeller = profile?.roles?.includes("vendor");
  const {
    data: escrowData,
    error: escrowFetchError,
    isLoading: isEscrowLoading,
  } = useSWR<EscrowListResponse>(
    !isAuthLoading && user ? ["dashboard-escrows", user.uid] : null,
    async () => get<EscrowListResponse>("/api/escrow?limit=5"),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      shouldRetryOnError: false,
    },
  );

  const escrows = escrowData?.items ?? [];
  const escrowError = escrowFetchError ? normalizeApiError(escrowFetchError) : null;

  const getStatusStyles = (status: string) => STATUS_STYLES[status] ?? "bg-(--surface-alt) text-(--ink-muted)";
  const escrowAmountTotal = escrows.reduce((sum, escrow) => sum + escrow.amount, 0);
  const lockedEscrowCount = escrows.filter((escrow) => escrow.status === "FUNDS_LOCKED").length;
  const awaitingPaymentCount = escrows.filter((escrow) => escrow.status === "AWAITING_PAYMENT").length;
  const verifyingCount = escrows.filter((escrow) => escrow.status === "VERIFYING").length;
  const humanReviewCount = escrows.filter((escrow) => escrow.status === "AWAITING_HUMAN_REVIEW").length;

  return (
    <main className="flex flex-col gap-8">
      <div className="flex flex-col gap-8">
            <section className="relative overflow-hidden rounded-[36px] border border-white/70 bg-white/70 p-7 shadow-(--shell-shadow)">
              <div className="absolute inset-0 section-bridge" />
              <div className="absolute inset-0 bg-gradient-to-br from-white/85 via-white/55 to-white/15" />
              <div className="relative z-10 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h1 className="heading-1">
                          {isAdmin ? "Operations center" : isSeller ? "Seller dashboard" : "Buyer dashboard"}
                      </h1>
                      <p className="subheading mt-3 max-w-[50ch]">
                        {isAdmin
                          ? "Monitor escrow performance, resolve disputes, and track payout processing."
                          : isSeller
                            ? "Create escrows, issue Squad virtual accounts, and track payout readiness."
                          : "Track your purchases, manage disputes, and view transaction history."}
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

                  <motion.div
                    className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
                    initial="hidden"
                    animate="visible"
                    variants={LIST_VARIANTS}
                  >
                    {isAdmin ? (
                      <>
                        <motion.div
                          className="rounded-2xl border border-white/70 bg-white/85 p-4"
                          variants={ITEM_VARIANTS}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-xs uppercase tracking-[0.2em] text-(--ink-soft)">Active escrows</p>
                            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-white/80 text-(--ink-muted)">
                              <IconPulse className="h-4 w-4" />
                            </span>
                          </div>
                          <p className="mt-2 text-xl font-semibold text-foreground">{escrows.length}</p>
                          <p className="mt-2 text-xs text-(--ink-muted)">Live from the current escrow feed</p>
                        </motion.div>
                        <motion.div
                          className="rounded-2xl border border-white/70 bg-white/85 p-4"
                          variants={ITEM_VARIANTS}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-xs uppercase tracking-[0.2em] text-(--ink-soft)">Awaiting verification</p>
                            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-white/80 text-(--ink-muted)">
                              <IconEye className="h-4 w-4" />
                            </span>
                          </div>
                          <p className="mt-2 text-xl font-semibold text-foreground">{awaitingPaymentCount + verifyingCount}</p>
                          <p className="mt-2 text-xs text-(--ink-muted)">Awaiting payment or verification</p>
                        </motion.div>
                        <motion.div
                          className="rounded-2xl border border-white/70 bg-white/85 p-4"
                          variants={ITEM_VARIANTS}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-xs uppercase tracking-[0.2em] text-(--ink-soft)">Under review</p>
                            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-white/80 text-(--ink-muted)">
                              <IconShield className="h-4 w-4" />
                            </span>
                          </div>
                          <p className="mt-2 text-xl font-semibold text-foreground">{humanReviewCount}</p>
                          <p className="mt-2 text-xs text-(--ink-muted)">Queued for human review</p>
                        </motion.div>
                        <motion.div
                          className="rounded-2xl border border-white/70 bg-white/85 p-4"
                          variants={ITEM_VARIANTS}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-xs uppercase tracking-[0.2em] text-(--ink-soft)">Released this week</p>
                            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-white/80 text-(--ink-muted)">
                              <IconWallet className="h-4 w-4" />
                            </span>
                          </div>
                          <p className="mt-2 text-xl font-semibold text-foreground">{lockedEscrowCount}</p>
                          <p className="mt-2 text-xs text-(--ink-muted)">Locked in settlement</p>
                        </motion.div>
                      </>
                    ) : (
                      <>
                        <motion.div
                          className="rounded-2xl border border-white/70 bg-white/85 p-4"
                          variants={ITEM_VARIANTS}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-xs uppercase tracking-[0.2em] text-(--ink-soft)">Total escrows</p>
                            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-white/80 text-(--ink-muted)">
                              <IconPulse className="h-4 w-4" />
                            </span>
                          </div>
                          <p className="mt-2 text-xl font-semibold text-foreground">{escrows.length}</p>
                          <p className="mt-2 text-xs text-(--ink-muted)">Fetched from your live dashboard feed</p>
                        </motion.div>
                        <motion.div
                          className="rounded-2xl border border-white/70 bg-white/85 p-4"
                          variants={ITEM_VARIANTS}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-xs uppercase tracking-[0.2em] text-(--ink-soft)">Escrow value</p>
                            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-white/80 text-(--ink-muted)">
                              <IconWallet className="h-4 w-4" />
                            </span>
                          </div>
                          <p className="mt-2 text-xl font-semibold text-foreground">{escrowAmountTotal.toLocaleString()}</p>
                          <p className="mt-2 text-xs text-(--ink-muted)">Live escrow value</p>
                        </motion.div>
                        <motion.div
                          className="rounded-2xl border border-white/70 bg-white/85 p-4"
                          variants={ITEM_VARIANTS}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-xs uppercase tracking-[0.2em] text-(--ink-soft)">Completion rate</p>
                            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-white/80 text-(--ink-muted)">
                              <IconEye className="h-4 w-4" />
                            </span>
                          </div>
                          <p className="mt-2 text-xl font-semibold text-foreground">{escrows.length ? Math.round(((escrows.length - awaitingPaymentCount - humanReviewCount) / escrows.length) * 100) : 0}%</p>
                          <p className="mt-2 text-xs text-(--ink-muted)">Derived from current escrow states</p>
                        </motion.div>
                        <motion.div
                          className="rounded-2xl border border-white/70 bg-white/85 p-4"
                          variants={ITEM_VARIANTS}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-xs uppercase tracking-[0.2em] text-(--ink-soft)">In progress</p>
                            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-white/80 text-(--ink-muted)">
                              <IconShield className="h-4 w-4" />
                            </span>
                          </div>
                          <p className="mt-2 text-xl font-semibold text-foreground">{Math.max(escrows.length - lockedEscrowCount, 0)}</p>
                          <p className="mt-2 text-xs text-(--ink-muted)">Still moving through the flow</p>
                        </motion.div>
                      </>
                    )}
                  </motion.div>
                </div>

                <div className="grid gap-4">
                  {isAdmin && (
                    <>
                      <div className="relative rounded-[30px] border border-white/70 bg-white/85 p-4 shadow-(--card-shadow) backdrop-blur">
                        <Image
                          alt="Wallet preview"
                          className="w-full rounded-[24px] object-cover"
                          src="/images/5f26813372e8df83a35831389b757450.jpg"
                          width={720}
                          height={480}
                          sizes="(max-width: 1024px) 100vw, 420px"
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
                          <p className="mt-2 text-base font-semibold text-foreground">Live escrow summary</p>
                          <p className="mt-1 text-xs text-(--ink-soft)">Current feed status across your recent escrows</p>
                        </div>
                        <div className="rounded-[22px] bg-(--action) p-4 text-sm text-(--action-ink)">
                          <p className="text-xs uppercase tracking-[0.2em] text-(--action-ink-dim)">Next release</p>
                          <p className="mt-2 text-base font-semibold">$28,420</p>
                          <p className="mt-1 text-xs text-(--action-ink-dim)">Latest feed activity</p>
                        </div>
                      </div>
                    </>
                  )}

                  {!isAdmin && (
                    <div className="grid gap-3">
                      <div className="rounded-[22px] border border-white/70 bg-white/85 p-4 text-sm">
                        <p className="text-xs uppercase tracking-[0.2em] text-(--ink-soft)">Your status</p>
                        <p className="mt-2 text-base font-semibold text-foreground">
                          {isSeller ? "Seller account" : "Buyer account"}
                        </p>
                        <p className="mt-1 text-xs text-(--ink-muted)">Verified and active</p>
                      </div>
                      <div className="rounded-[22px] bg-(--accent-fog) p-4 text-sm">
                        <p className="text-xs uppercase tracking-[0.2em] text-(--ink-soft)">Next payout</p>
                        <p className="mt-2 text-base font-semibold text-foreground">$2,350.00</p>
                        <p className="mt-1 text-xs text-(--ink-soft)">Processing in 2 days</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
              {isAdmin && (
                <div className="relative overflow-hidden rounded-[32px] border border-white/70 bg-white/75 p-6 shadow-(--card-shadow)">
                  <div className="absolute inset-0 section-mist" />
                  <div className="relative z-10">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <h2 className="heading-2">Escrow volume</h2>
                        <p className="mt-2 text-sm text-(--ink-muted)">30-day transaction flow across all corridors.</p>
                      </div>
                      <div className="text-xs text-(--ink-soft)">
                        <p>30 days · All corridors</p>
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
              )}

              <div className="grid gap-6">
                {isAdmin && (
                  <>
                    <div className="relative overflow-hidden rounded-[30px] border border-white/70 bg-white/75 p-5 shadow-(--card-shadow)">
                      <div className="absolute inset-0 section-aurora" />
                      <div className="relative z-10">
                        <h3 className="heading-3">Escrow health</h3>
                        <p className="mt-1 text-sm text-(--ink-muted)">Risk split by confidence level.</p>
                        <div className="mt-5 flex items-center gap-4">
                          <div className="risk-ring h-20 w-20 rounded-full" />
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
                        <h3 className="heading-3">System checks</h3>
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
                  </>
                )}

                {!isAdmin && (
                  <>
                    <div className="relative overflow-hidden rounded-[30px] border border-white/70 bg-white/75 p-5 shadow-(--card-shadow)">
                      <div className="absolute inset-0 section-aurora" />
                      <div className="relative z-10">
                        <h3 className="heading-3">Account balance</h3>
                        <p className="mt-1 text-sm text-(--ink-muted)">Live escrow value from the current feed.</p>
                        <div className="mt-5">
                          <p className="text-2xl font-semibold text-foreground">{escrowAmountTotal.toLocaleString()}</p>
                          <p className="mt-2 text-xs text-(--ink-soft)">Total value in the live escrow feed</p>
                        </div>
                      </div>
                    </div>

                    <div className="relative overflow-hidden rounded-[30px] p-5 text-(--action-ink) shadow-(--card-shadow)">
                      <div className="absolute inset-0 section-emerald" />
                      <div className="relative">
                        <h3 className="heading-3">Performance snapshot</h3>
                        <div className="mt-4 space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span>Active escrows</span>
                            <span className="text-(--action-ink) font-semibold">{escrows.length}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Total escrow value</span>
                            <span className="text-(--action-ink) font-semibold">{escrowAmountTotal.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Completion rate</span>
                            <span className="text-(--action-ink) font-semibold">{escrows.length ? Math.round(((escrows.length - awaitingPaymentCount - humanReviewCount) / escrows.length) * 100) : 0}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-[2.1fr_1fr]">
              <div className="rounded-[32px] border border-white/70 bg-white/75 p-6 shadow-(--card-shadow) backdrop-blur">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="heading-2">Active escrows</h2>
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
                <motion.div
                  className="mt-5 space-y-3"
                  initial="hidden"
                  animate="visible"
                  variants={LIST_VARIANTS}
                >
                  {!user ? (
                    <div className="rounded-[24px] border border-white/70 bg-white/80 px-4 py-4 text-sm text-(--ink-muted)">
                      Sign in to see your active escrows.
                    </div>
                  ) : isEscrowLoading ? (
                    <div className="rounded-[24px] border border-white/70 bg-white/80 px-4 py-4 text-sm text-(--ink-muted)">
                      Loading escrows...
                    </div>
                  ) : escrows.length === 0 ? (
                    <div className="rounded-[24px] border border-white/70 bg-white/80 px-4 py-4 text-sm text-(--ink-muted)">
                      No escrows yet.
                    </div>
                  ) : (
                    escrows.map((escrow) => (
                      <motion.div
                        key={escrow.id}
                        variants={ITEM_VARIANTS}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                      >
                        <Link
                          className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-white/70 bg-white/80 px-4 py-4 shadow-(--card-shadow)"
                          href={`/escrow/${escrow.id}`}
                        >
                          <div>
                            <p className="text-sm font-semibold text-foreground">{escrow.id}</p>
                            <p className="mt-1 text-sm text-(--ink-muted)">
                              {escrow.amount} {escrow.currency} · {escrow.buyer_email}
                            </p>
                            {escrow.description && (
                              <p className="mt-1 text-xs text-(--ink-soft)">{escrow.description}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-foreground">
                              {escrow.updated_at ? "Updated" : "Created"}
                            </p>
                            <p className="mt-1 text-xs text-(--ink-soft)">
                              {escrow.updated_at ?? "--"}
                            </p>
                          </div>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyles(
                              escrow.status
                            )}`}
                          >
                            {escrow.status.replaceAll("_", " ")}
                          </span>
                        </Link>
                      </motion.div>
                    ))
                  )}
                </motion.div>
                {escrowError && (
                  <div className="mt-4 rounded-[24px] border border-white/70 bg-white/80 px-4 py-4 text-sm text-(--ink-muted)">
                    <p className="font-semibold text-foreground">{escrowError.title}</p>
                    <p className="mt-1">{escrowError.message}</p>
                  </div>
                )}
              </div>

              <div className="grid gap-6">
                {isAdmin && (
                  <section className="rounded-[30px] border border-white/70 bg-white/75 p-5 shadow-(--card-shadow) backdrop-blur">
                    <h3 className="heading-3">Review queue</h3>
                    <p className="mt-2 text-sm text-(--ink-muted)">Escrows awaiting human decision.</p>
                    <div className="mt-4 rounded-[22px] border border-white/70 bg-white/80 p-4 text-sm text-(--ink-muted)">
                      <p>No items currently under review.</p>
                    </div>
                  </section>
                )}

                {isAdmin && (
                  <section className="rounded-[30px] border border-white/70 bg-white/75 p-5 shadow-(--card-shadow) backdrop-blur">
                    <h3 className="heading-3">Live activity</h3>
                    <div className="mt-4 rounded-[22px] bg-(--surface-alt) px-4 py-3 text-sm text-(--ink-muted)">
                      <p>No activity logged.</p>
                    </div>
                  </section>
                )}

                {!isAdmin && (
                  <section className="rounded-[30px] border border-white/70 bg-white/75 p-5 shadow-(--card-shadow) backdrop-blur">
                    <h3 className="heading-3">Quick tips</h3>
                    <p className="mt-1 text-sm text-(--ink-muted)">Get the most out of Border Safe.</p>
                    <div className="mt-4 space-y-3">
                      <div className="rounded-[22px] bg-(--surface-alt) px-4 py-3">
                        <p className="text-sm font-semibold text-foreground">Enable notifications</p>
                        <p className="mt-1 text-xs text-(--ink-muted)">Get instant updates on your escrows</p>
                      </div>
                      <div className="rounded-[22px] bg-(--surface-alt) px-4 py-3">
                        <p className="text-sm font-semibold text-foreground">Link payment method</p>
                        <p className="mt-1 text-xs text-(--ink-muted)">Speed up payouts with saved accounts</p>
                      </div>
                    </div>
                  </section>
                )}
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
              {isAdmin && (
                <div className="rounded-[32px] border border-white/70 bg-white/75 p-6 shadow-(--card-shadow) backdrop-blur">
                  <h2 className="heading-2">Recent payouts</h2>
                  <p className="mt-2 text-sm text-(--ink-muted)">Latest releases executed by payout partners.</p>
                  <div className="mt-5 rounded-[24px] border border-white/70 bg-white/80 p-4 text-sm text-(--ink-muted)">
                    <p>No recent payouts.</p>
                  </div>
                </div>
              )}

              {!isAdmin && (
                <div className="rounded-[32px] border border-white/70 bg-white/75 p-6 shadow-(--card-shadow) backdrop-blur">
                  <h2 className="heading-2">Recent transactions</h2>
                  <p className="mt-1 text-sm text-(--ink-muted)">Your latest escrow activity and updates.</p>
                  <div className="mt-5 space-y-3">
                    {escrows.length > 0 ? (
                      escrows.slice(0, 3).map((escrow) => (
                        <div
                          key={escrow.id}
                          className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] bg-(--surface-alt) px-4 py-3"
                        >
                          <div>
                            <p className="text-sm font-semibold text-foreground">{escrow.id}</p>
                            <p className="text-xs text-(--ink-soft)">
                              {escrow.amount} {escrow.currency}
                            </p>
                          </div>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyles(escrow.status)}`}>
                            {escrow.status.replaceAll("_", " ")}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-[24px] bg-(--surface-alt) px-4 py-3 text-sm text-(--ink-muted)">
                        No transactions yet. Start your first escrow!
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="rounded-[32px] border border-white/70 bg-white/75 p-6 shadow-(--card-shadow) backdrop-blur">
                <h2 className="heading-2">Quick actions</h2>
                <div className="mt-4 grid gap-3">
                  {isAdmin ? (
                    <>
                      <Link
                        className="rounded-[22px] bg-(--action) px-4 py-3 text-sm font-semibold text-(--action-ink)"
                        href="/admin"
                      >
                        Review queue
                      </Link>
                      <Link
                        className="rounded-[22px] border border-white/70 bg-white/80 px-4 py-3 text-sm font-semibold text-foreground"
                        href="/escrow"
                      >
                        Inspect escrows
                      </Link>
                      <Link
                        className="rounded-[22px] border border-white/70 bg-white/80 px-4 py-3 text-sm font-semibold text-foreground"
                        href="/wallet"
                      >
                        Open wallet
                      </Link>
                    </>
                  ) : isSeller ? (
                    <>
                      <Link
                        className="rounded-[22px] bg-(--action) px-4 py-3 text-sm font-semibold text-(--action-ink)"
                        href="/escrow/new"
                      >
                        Create escrow
                      </Link>
                      <Link
                        className="rounded-[22px] border border-white/70 bg-white/80 px-4 py-3 text-sm font-semibold text-foreground"
                        href="/dashboard/stores"
                      >
                        Manage stores
                      </Link>
                      <Link
                        className="rounded-[22px] border border-white/70 bg-white/80 px-4 py-3 text-sm font-semibold text-foreground"
                        href="/wallet"
                      >
                        Open wallet
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        className="rounded-[22px] bg-(--action) px-4 py-3 text-sm font-semibold text-(--action-ink)"
                        href="/escrow"
                      >
                        View escrows
                      </Link>
                      <Link
                        className="rounded-[22px] border border-white/70 bg-white/80 px-4 py-3 text-sm font-semibold text-foreground"
                        href="/escrow"
                      >
                        Confirm delivery
                      </Link>
                      <Link
                        className="rounded-[22px] border border-white/70 bg-white/80 px-4 py-3 text-sm font-semibold text-foreground"
                        href="/wallet"
                      >
                        Open wallet
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </section>
          </div>
    </main>
  );
}
