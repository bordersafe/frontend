"use client";

import { useCallback, useEffect, useState } from "react";
import { normalizeApiError } from "@/lib/api";
import { useAuthedApi } from "@/lib/api/auth-client";
import type { UiError } from "@/lib/api";

type FraudAnalysis = {
  escrow_id: string;
  fraud_risk_score: number;
  risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  factors: Array<{
    factor: string;
    score: number;
    description: string;
  }>;
  account_links: Array<{
    user_id: string;
    linking_type: string;
    confidence: number;
  }>;
  analyzed_at: string;
};

type WatchlistEntry = {
  id: string;
  user_id: string;
  type: "BUYER" | "SELLER";
  added_at: string;
  reason: string;
  status: "ACTIVE" | "RESOLVED" | "APPEALED";
  added_by: string;
  expires_at?: string | null;
};

type TabType = "watchlist" | "analyze" | "account-links";

function FraudRiskBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    LOW: "bg-(--success-soft) text-(--success)",
    MEDIUM: "bg-(--warning-soft) text-(--warning)",
    HIGH: "bg-(--danger-soft) text-(--danger)",
    CRITICAL: "bg-red-100 text-red-900",
  };

  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${colors[level] || "bg-(--ink-soft)"}`}
    >
      {level}
    </span>
  );
}

function FraudMeter({ score }: { score: number }) {
  const percentage = (score / 100) * 100;
  const color =
    score >= 75 ? "bg-red-500" : score >= 50 ? "bg-orange-500" : score >= 25 ? "bg-yellow-500" : "bg-green-500";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">Fraud Risk</span>
        <span className="text-lg font-bold text-foreground">{score}%</span>
      </div>
      <div className="h-3 w-full rounded-full bg-(--surface-soft)">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

export default function FraudDashboardPage() {
  const { user, profile, isAuthLoading, get, post } = useAuthedApi();
  const isAdminUser = profile?.roles?.includes("admin") || profile?.roles?.includes("hitl");

  const [activeTab, setActiveTab] = useState<TabType>("watchlist");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<UiError | null>(null);

  // Watchlist tab state
  const [watchlistEntries, setWatchlistEntries] = useState<WatchlistEntry[]>([]);
  const [watchlistStatus, setWatchlistStatus] = useState<"ACTIVE" | "RESOLVED" | "APPEALED">("ACTIVE");
  const [isLoadingWatchlist, setIsLoadingWatchlist] = useState(false);

  // Analyze tab state
  const [escrowIdToAnalyze, setEscrowIdToAnalyze] = useState("");
  const [fraudAnalysis, setFraudAnalysis] = useState<FraudAnalysis | null>(null);
  const [isAnalyzingFraud, setIsAnalyzingFraud] = useState(false);

  // Account links tab state
  const [userIdToCheck, setUserIdToCheck] = useState("");
  const [targetUserIdToCheck, setTargetUserIdToCheck] = useState("");
  const [linkAnalysis, setLinkAnalysis] = useState<any>(null);
  const [isCheckingLinks, setIsCheckingLinks] = useState(false);

  // Fetch watchlist
  const fetchWatchlist = useCallback(async () => {
    setIsLoadingWatchlist(true);
    setError(null);

    try {
      const response = await get<any>(`/api/admin/watchlist?status=${watchlistStatus}&limit=50`);
      setWatchlistEntries(response.items || []);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsLoadingWatchlist(false);
    }
  }, [get, watchlistStatus]);

  // Fetch fraud analysis
  const analyzeFraud = useCallback(async () => {
    if (!escrowIdToAnalyze.trim()) {
      setError({
        kind: "VALIDATION",
        title: "Missing escrow ID",
        message: "Please enter an escrow ID to analyze.",
        retryable: false,
        correlationId: null,
        status: 400,
      });
      return;
    }

    setIsAnalyzingFraud(true);
    setError(null);

    try {
      const response = await get<FraudAnalysis>(`/api/admin/escrow/${escrowIdToAnalyze}/fraud-analysis`);
      setFraudAnalysis(response);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsAnalyzingFraud(false);
    }
  }, [get, escrowIdToAnalyze]);

  // Check account links
  const checkAccountLinks = useCallback(async () => {
    if (!userIdToCheck.trim() || !targetUserIdToCheck.trim()) {
      setError({
        kind: "VALIDATION",
        title: "Missing user IDs",
        message: "Please enter both user IDs to check for links.",
        retryable: false,
        correlationId: null,
        status: 400,
      });
      return;
    }

    setIsCheckingLinks(true);
    setError(null);

    try {
      const response = await post<any>(`/api/admin/account/${userIdToCheck}/link-check`, {
        target_user_id: targetUserIdToCheck,
      });
      setLinkAnalysis(response);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsCheckingLinks(false);
    }
  }, [post, userIdToCheck, targetUserIdToCheck]);

  // Resolve watchlist entry
  const resolveWatchlistEntry = async (entryId: string, resolution: "RESOLVED" | "APPEALED") => {
    try {
      await post(`/api/admin/watchlist/${entryId}/resolve`, { resolution });
      await fetchWatchlist();
    } catch (err) {
      setError(normalizeApiError(err));
    }
  };

  useEffect(() => {
    if (activeTab === "watchlist") {
      fetchWatchlist();
    }
  }, [activeTab, watchlistStatus, fetchWatchlist]);

  if (isAuthLoading) {
    return (
      <main className="flex min-h-full flex-col gap-6 px-4 py-6 sm:px-8 lg:px-10">
        <section className="panel p-6 text-center text-sm text-(--ink-muted)">
          Loading...
        </section>
      </main>
    );
  }

  if (!isAdminUser) {
    return (
      <main className="flex min-h-full flex-col gap-6 px-4 py-6 sm:px-8 lg:px-10">
        <section className="panel p-6">
          <h1 className="heading-1">Access Denied</h1>
          <p className="mt-2 text-sm text-(--ink-muted)">
            You don't have permission to access the fraud detection dashboard.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-full flex-col gap-6 px-4 py-6 sm:px-8 lg:px-10">
      <header className="panel p-6">
        <h1 className="heading-1">Fraud Detection</h1>
        <p className="mt-2 text-sm text-(--ink-muted)">
          Monitor fraud risk, manage watchlist, and detect account linking patterns.
        </p>
      </header>

      {error && (
        <section className="panel-outline p-5 text-sm text-(--ink-muted)">
          <p className="font-semibold text-foreground">{error.title}</p>
          <p className="mt-1">{error.message}</p>
        </section>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-(--ink-border)">
        <button
          className={`px-4 py-3 text-sm font-semibold transition-colors ${
            activeTab === "watchlist"
              ? "border-b-2 border-(--action) text-(--action)"
              : "text-(--ink-muted) hover:text-foreground"
          }`}
          onClick={() => setActiveTab("watchlist")}
          type="button"
        >
          Watchlist
        </button>
        <button
          className={`px-4 py-3 text-sm font-semibold transition-colors ${
            activeTab === "analyze"
              ? "border-b-2 border-(--action) text-(--action)"
              : "text-(--ink-muted) hover:text-foreground"
          }`}
          onClick={() => setActiveTab("analyze")}
          type="button"
        >
          Analyze Escrow
        </button>
        <button
          className={`px-4 py-3 text-sm font-semibold transition-colors ${
            activeTab === "account-links"
              ? "border-b-2 border-(--action) text-(--action)"
              : "text-(--ink-muted) hover:text-foreground"
          }`}
          onClick={() => setActiveTab("account-links")}
          type="button"
        >
          Account Links
        </button>
      </div>

      {/* Watchlist Tab */}
      {activeTab === "watchlist" && (
        <section className="space-y-6">
          <div className="panel p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="heading-2">Fraud Watchlist</h2>
              <select
                className="select-field text-sm"
                value={watchlistStatus}
                onChange={(e) => setWatchlistStatus(e.target.value as any)}
                aria-label="Filter watchlist by status"
              >
                <option value="ACTIVE">Active</option>
                <option value="RESOLVED">Resolved</option>
                <option value="APPEALED">Appealed</option>
              </select>
            </div>

            {isLoadingWatchlist ? (
              <p className="mt-6 text-center text-sm text-(--ink-muted)">Loading watchlist...</p>
            ) : watchlistEntries.length === 0 ? (
              <p className="mt-6 text-center text-sm text-(--ink-muted)">No {watchlistStatus.toLowerCase()} entries</p>
            ) : (
              <div className="mt-6 space-y-3">
                {watchlistEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex flex-col gap-4 rounded-lg border border-(--ink-border) p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="inline-block rounded-full bg-(--ink-soft) px-2 py-1 text-xs font-semibold text-(--ink-muted)">
                          {entry.type}
                        </span>
                        <p className="font-semibold text-foreground">{entry.user_id}</p>
                      </div>
                      <p className="mt-2 text-sm text-(--ink-muted)">{entry.reason}</p>
                      <p className="mt-1 text-xs text-(--ink-muted)">
                        Added {new Date(entry.added_at).toLocaleDateString()}
                        {entry.expires_at && ` • Expires ${new Date(entry.expires_at).toLocaleDateString()}`}
                      </p>
                    </div>

                    {entry.status === "ACTIVE" && (
                      <div className="flex gap-2">
                        <button
                          className="btn-secondary text-xs px-3 py-2"
                          onClick={() => resolveWatchlistEntry(entry.id, "RESOLVED")}
                          type="button"
                        >
                          Resolve
                        </button>
                        <button
                          className="btn-outline text-xs px-3 py-2"
                          onClick={() => resolveWatchlistEntry(entry.id, "APPEALED")}
                          type="button"
                        >
                          Appeal
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Analyze Escrow Tab */}
      {activeTab === "analyze" && (
        <section className="space-y-6">
          <div className="panel p-6">
            <h2 className="heading-2">Analyze Escrow for Fraud Risk</h2>
            <div className="mt-6 flex gap-2">
              <input
                className="input-field flex-1 text-sm"
                placeholder="Enter escrow ID..."
                type="text"
                value={escrowIdToAnalyze}
                onChange={(e) => setEscrowIdToAnalyze(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    analyzeFraud();
                  }
                }}
              />
              <button
                className="btn-primary px-4 py-2 text-sm"
                onClick={analyzeFraud}
                disabled={isAnalyzingFraud || !escrowIdToAnalyze.trim()}
                type="button"
              >
                {isAnalyzingFraud ? "Analyzing..." : "Analyze"}
              </button>
            </div>
          </div>

          {fraudAnalysis && (
            <div className="space-y-6">
              {/* Fraud Score Overview */}
              <div className="panel p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="heading-3">{fraudAnalysis.escrow_id}</h3>
                    <p className="mt-2 text-sm text-(--ink-muted)">Analyzed {fraudAnalysis.analyzed_at}</p>
                  </div>
                  <FraudRiskBadge level={fraudAnalysis.risk_level} />
                </div>

                <div className="mt-6">
                  <FraudMeter score={fraudAnalysis.fraud_risk_score} />
                </div>
              </div>

              {/* Risk Factors */}
              {fraudAnalysis.factors.length > 0 && (
                <div className="panel p-6">
                  <h3 className="heading-3">Risk Factors</h3>
                  <div className="mt-4 space-y-3">
                    {fraudAnalysis.factors.map((factor, index) => (
                      <div key={index} className="flex items-center justify-between gap-4 rounded-lg bg-(--surface-soft) p-4">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-foreground">{factor.description}</p>
                          <p className="mt-1 text-xs text-(--ink-muted)">{factor.factor}</p>
                        </div>
                        <span className="text-lg font-bold text-(--action)">{factor.score.toFixed(1)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Account Links */}
              {fraudAnalysis.account_links.length > 0 && (
                <div className="panel p-6">
                  <h3 className="heading-3">Detected Account Links</h3>
                  <div className="mt-4 space-y-2">
                    {fraudAnalysis.account_links.map((link, index) => (
                      <div key={index} className="flex items-center justify-between gap-2 rounded-lg bg-(--danger-soft) p-4">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{link.linking_type}</p>
                          <p className="text-xs text-(--ink-muted)">{link.user_id}</p>
                        </div>
                        <span className="text-sm font-bold text-(--danger)">
                          {(link.confidence * 100).toFixed(0)}% confidence
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* Account Links Tab */}
      {activeTab === "account-links" && (
        <section className="space-y-6">
          <div className="panel p-6">
            <h2 className="heading-2">Check Account Linking</h2>
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground">User ID 1</label>
                <input
                  className="input-field mt-2 text-sm"
                  placeholder="Enter first user ID..."
                  type="text"
                  value={userIdToCheck}
                  onChange={(e) => setUserIdToCheck(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground">User ID 2</label>
                <input
                  className="input-field mt-2 text-sm"
                  placeholder="Enter second user ID..."
                  type="text"
                  value={targetUserIdToCheck}
                  onChange={(e) => setTargetUserIdToCheck(e.target.value)}
                />
              </div>

              <button
                className="btn-primary px-4 py-2 text-sm"
                onClick={checkAccountLinks}
                disabled={isCheckingLinks || !userIdToCheck.trim() || !targetUserIdToCheck.trim()}
                type="button"
              >
                {isCheckingLinks ? "Checking..." : "Check for Links"}
              </button>
            </div>
          </div>

          {linkAnalysis && (
            <div className="panel p-6">
              <div className="flex items-center justify-between gap-4">
                <h3 className="heading-3">Analysis Results</h3>
                <span className="inline-block rounded-full bg-(--action-soft) px-3 py-1 text-xs font-semibold text-(--action)">
                  Risk Score: {linkAnalysis.risk_score}%
                </span>
              </div>

              {linkAnalysis.potential_links.length === 0 ? (
                <p className="mt-4 text-sm text-(--ink-muted)">No account links detected</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {linkAnalysis.potential_links.map((link: any, index: number) => (
                    <div key={index} className="rounded-lg border border-(--action-border) bg-(--action-soft) p-4">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{link.linking_type}</p>
                          <p className="mt-1 text-xs text-(--ink-muted)">
                            {link.evidence.join(" • ")}
                          </p>
                        </div>
                        <span className="text-sm font-bold text-(--action)">
                          {(link.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
