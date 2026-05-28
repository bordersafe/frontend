"use client";

import { useState } from "react";
import { useAuthedApi } from "@/lib/api/auth-client";
import { useToast } from "@/lib/toast-context";
import { useConfirm } from "@/app/_components/confirm-dialog";
import { formatCurrency } from "@/lib/format";
import type { BankAccountsListResponse } from "@/lib/api/types";

interface BankAccountManagerProps {
  accounts: BankAccountsListResponse | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export function BankAccountManager({
  accounts,
  isLoading,
  onRefresh,
}: BankAccountManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    account_number: "",
    account_name: "",
    bank_name: "",
    bank_code: "",
    is_default: false,
  });
  const [addError, setAddError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { post, patch, delete: del } = useAuthedApi();
  const { toast } = useToast();
  const { confirm, ConfirmDialogComponent } = useConfirm();

  const handleAddAccount = async () => {
    if (!formData.account_number || !formData.account_name || !formData.bank_name) {
      setAddError("Please fill in all required fields.");
      return;
    }
    if (formData.account_number.length !== 10) {
      setAddError("Account number must be exactly 10 digits (NUBAN).");
      return;
    }

    try {
      setSubmitting(true);
      setAddError(null);
      await post("/api/wallet/bank-accounts", formData);
      setFormData({
        account_number: "",
        account_name: "",
        bank_name: "",
        bank_code: "",
        is_default: false,
      });
      setIsAdding(false);
      onRefresh();
      toast({ message: "Bank account added.", variant: "success" });
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Failed to add account.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    const ok = await confirm({
      title: "Remove bank account?",
      description:
        "This account will be removed from your profile. Any pending payouts using this account may be affected.",
      confirmLabel: "Remove",
      variant: "danger",
    });
    if (!ok) return;

    try {
      await del(`/api/wallet/bank-accounts/${accountId}`);
      onRefresh();
      toast({ message: "Bank account removed.", variant: "info" });
    } catch (err) {
      toast({
        message: err instanceof Error ? err.message : "Failed to remove account.",
        variant: "danger",
      });
    }
  };

  const handleSetDefault = async (accountId: string) => {
    try {
      await patch(`/api/wallet/bank-accounts/${accountId}`, { is_default: true });
      onRefresh();
      toast({ message: "Default account updated.", variant: "success" });
    } catch (err) {
      toast({
        message: err instanceof Error ? err.message : "Failed to update account.",
        variant: "danger",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="panel p-6">
        <div className="skeleton h-5 w-32 rounded" />
        <div className="mt-4 space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="skeleton h-16 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {ConfirmDialogComponent}
      <div className="panel p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Bank accounts</h3>
          <button
            onClick={() => {
              setIsAdding(!isAdding);
              setAddError(null);
            }}
            className="btn-secondary px-4 py-2 text-xs"
            type="button"
          >
            {isAdding ? "Cancel" : "+ Add account"}
          </button>
        </div>

        {isAdding && (
          <div className="mb-6 panel-muted space-y-4 p-5 rounded-2xl">
            <h4 className="text-xs font-semibold text-foreground">New bank account</h4>

            <div>
              <label className="kicker block mb-1" htmlFor="acct-number">
                Account number <span className="font-normal normal-case text-(--ink-soft)">(10 digits, NUBAN)</span>
              </label>
              <input
                id="acct-number"
                type="text"
                inputMode="numeric"
                maxLength={10}
                placeholder="0123456789"
                value={formData.account_number}
                onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label className="kicker block mb-1" htmlFor="acct-name">Account name</label>
              <input
                id="acct-name"
                type="text"
                placeholder="e.g. John Doe"
                value={formData.account_name}
                onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label className="kicker block mb-1" htmlFor="bank-name">Bank name</label>
              <input
                id="bank-name"
                type="text"
                placeholder="e.g. Access Bank"
                value={formData.bank_name}
                onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label className="kicker block mb-1" htmlFor="bank-code">
                Bank code{" "}
                <span className="font-normal normal-case text-(--ink-soft)">(optional — 3-digit CBN code)</span>
              </label>
              <input
                id="bank-code"
                type="text"
                inputMode="numeric"
                placeholder="044"
                value={formData.bank_code}
                onChange={(e) => setFormData({ ...formData, bank_code: e.target.value })}
                className="input-field"
              />
            </div>

            <label className="flex items-center gap-3 text-sm text-(--ink-muted)">
              <input
                type="checkbox"
                checked={formData.is_default}
                onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                className="h-4 w-4 rounded"
              />
              Set as default payout account
            </label>

            {addError && (
              <p className="text-sm text-(--danger)" role="alert">
                {addError}
              </p>
            )}

            <button
              onClick={() => void handleAddAccount()}
              disabled={submitting}
              className="btn-primary w-full px-4 py-3 text-sm disabled:opacity-60"
              type="button"
            >
              {submitting ? "Adding…" : "Add account"}
            </button>
          </div>
        )}

        {!accounts || accounts.count === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm font-semibold text-foreground">No bank accounts yet</p>
            <p className="mt-1 text-sm text-(--ink-muted)">
              Add an account to enable payouts from your wallet.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {accounts.items.map((account) => (
              <div
                key={account.id}
                className={`rounded-2xl border p-4 ${
                  account.is_default
                    ? "border-(--primary)/30 bg-(--primary)/5"
                    : "border-(--border-soft) bg-white/50"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground truncate">{account.account_name}</p>
                    <p className="mt-0.5 text-sm text-(--ink-muted)">
                      {account.bank_name}
                      {" · "}
                      {/* Fixed mask: always shows last 4 digits of a 10-digit NUBAN */}
                      {"****" + account.account_number.slice(-4)}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {account.is_default && (
                        <span className="chip text-(--primary) bg-(--primary)/8 border-(--primary)/20">
                          Default
                        </span>
                      )}
                      {account.verified && (
                        <span className="chip text-(--success) bg-(--success)/8 border-(--success)/20">
                          Verified ✓
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col gap-2">
                    {!account.is_default && (
                      <button
                        onClick={() => void handleSetDefault(account.id)}
                        className="btn-outline px-3 py-1.5 text-xs"
                        type="button"
                      >
                        Set default
                      </button>
                    )}
                    <button
                      onClick={() => void handleDeleteAccount(account.id)}
                      className="btn-outline px-3 py-1.5 text-xs text-(--danger) border-(--danger)/30 hover:bg-(--danger)/5"
                      type="button"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
