"use client";

import { useState } from "react";
import { useAuthedApi } from "@/lib/api/auth-client";
import { useToast } from "@/lib/toast-context";
import { Modal } from "@/app/_components/modal";
import { formatCurrency } from "@/lib/format";
import type { BankAccountsListResponse } from "@/lib/api/types";

interface ImmediatePayoutModalProps {
  isOpen: boolean;
  availableBalance: number;
  bankAccounts: BankAccountsListResponse | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function ImmediatePayoutModal({
  isOpen,
  availableBalance,
  bankAccounts,
  onClose,
  onSuccess,
}: ImmediatePayoutModalProps) {
  const [amount, setAmount] = useState("");
  const [bankAccountId, setBankAccountId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { post } = useAuthedApi();
  const { toast } = useToast();

  const parsedAmount = Number(amount) || 0;
  const fee = parsedAmount > 0 ? Math.ceil(parsedAmount * 0.01) : 0;
  const total = parsedAmount + fee;

  const handleClose = () => {
    setAmount("");
    setBankAccountId("");
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!amount || !bankAccountId) {
      setError("Please enter an amount and select a bank account.");
      return;
    }

    if (parsedAmount <= 0) {
      setError("Amount must be greater than ₦0.");
      return;
    }

    if (total > availableBalance) {
      setError(
        `Insufficient balance. Available: ${formatCurrency(availableBalance)}`,
      );
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      await post("/api/wallet/payout/request", {
        amount: parsedAmount,
        bank_account_id: bankAccountId,
        immediate: true,
      });

      setAmount("");
      setBankAccountId("");
      onSuccess();
      toast({
        message: "Payout requested. Processing in 1–2 business days.",
        variant: "success",
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to request payout.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Request immediate payout"
      subtitle={`Available balance: ${formatCurrency(availableBalance)}`}
      maxWidth="max-w-md"
    >
      {error && (
        <div className="panel-danger mb-5 p-4 text-sm text-(--danger)" role="alert">
          {error}
        </div>
      )}

      <div className="space-y-5">
        <div>
          <label className="kicker block mb-2" htmlFor="payout-amount">
            Amount
          </label>
          {/* ₦ symbol on the LEFT, per Nigerian banking convention */}
          <div className="flex items-center gap-2 rounded-[18px] border border-(--border-soft) bg-(--surface-soft) px-4 py-3 focus-within:border-[rgba(47,125,116,0.45)] focus-within:shadow-[0_0_0_3px_rgba(47,125,116,0.18)]">
            <span className="shrink-0 font-semibold text-(--ink-muted)">₦</span>
            <input
              id="payout-amount"
              type="number"
              min="1"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder-text-(--ink-soft)"
            />
          </div>
          {parsedAmount > 0 && (
            <p className="mt-1 text-xs text-(--ink-soft)">
              Includes 1% fee of {formatCurrency(fee)}.
            </p>
          )}
        </div>

        <div>
          <label className="kicker block mb-2" htmlFor="payout-bank">
            Bank account
          </label>
          <select
            id="payout-bank"
            value={bankAccountId}
            onChange={(e) => setBankAccountId(e.target.value)}
            className="select-field"
          >
            <option value="">Select account…</option>
            {bankAccounts?.items.map((account) => (
              <option key={account.id} value={account.id}>
                {account.account_name} · {account.bank_name}
              </option>
            ))}
          </select>
        </div>

        {parsedAmount > 0 && (
          <div className="panel-muted space-y-2 p-4 text-sm text-(--ink-muted)">
            <div className="flex justify-between">
              <span>Amount</span>
              <span className="font-semibold text-foreground">
                {formatCurrency(parsedAmount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Fee (1%)</span>
              <span className="font-semibold text-foreground">
                {formatCurrency(fee)}
              </span>
            </div>
            <div className="flex justify-between border-t border-(--border-soft) pt-2">
              <span className="font-medium text-foreground">Total</span>
              <span className="font-bold text-(--primary)">
                {formatCurrency(total)}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={handleClose}
          className="btn-outline flex-1 px-4 py-3 text-sm"
          type="button"
        >
          Cancel
        </button>
        <button
          onClick={() => void handleSubmit()}
          disabled={submitting || !amount || !bankAccountId}
          className="btn-primary flex-1 px-4 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
          type="button"
        >
          {submitting ? "Processing…" : "Request payout"}
        </button>
      </div>
    </Modal>
  );
}
