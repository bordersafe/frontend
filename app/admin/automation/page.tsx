"use client";

import { useCallback, useEffect, useState } from "react";
import { normalizeApiError } from "@/lib/api";
import { useAuthedApi } from "@/lib/api/auth-client";
import type { UiError } from "@/lib/api";

type DecisionSuggestion = {
  suggested_decision: "APPROVE" | "REFUND" | "HOLD" | "ESCALATE";
  confidence: number;
  reasoning: string;
  key_factors: string[];
  risk_indicators: string[];
};

type Anomaly = {
  escrow_id: string;
  anomaly_type: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  description: string;
  detected_at: string;
  recommended_action: string;
};

type AutomationRule = {
  id: string;
  rule_name: string;
  condition_type: string;
  condition_value: number;
  action: string;
  enabled: boolean;
};

type TabType = "suggestions" | "anomalies" | "rules" | "stats";

export default function AutomationPage() {
  const { user, profile, isAuthLoading, get, post, patch, delete: deleteReq } = useAuthedApi();
  const isAdminUser = profile?.roles?.includes("admin") || profile?.roles?.includes("hitl");
  const isSuperAdmin = profile?.roles?.includes("super_admin");

  const [activeTab, setActiveTab] = useState<TabType>("suggestions");
  const [error, setError] = useState<UiError | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Suggestions tab
  const [escrowIdInput, setEscrowIdInput] = useState("");
  const [suggestion, setSuggestion] = useState<DecisionSuggestion | null>(null);
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);

  // Anomalies tab
  const [anomaliesEscrowId, setAnomaliesEscrowId] = useState("");
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [isLoadingAnomalies, setIsLoadingAnomalies] = useState(false);

  // Rules tab
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [isLoadingRules, setIsLoadingRules] = useState(false);
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [ruleForm, setRuleForm] = useState({
    rule_name: "",
    condition_type: "FRAUD_SCORE",
    condition_value: 70,
    action: "HOLD",
  });

  // Stats tab
  const [stats, setStats] = useState<any>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Generate decision suggestion
  const generateSuggestion = async () => {
    if (!escrowIdInput) {
      setError({
        kind: "VALIDATION",
        title: "Error",
        message: "Please enter an escrow ID",
        retryable: false,
        correlationId: null,
        status: 400,
      });
      return;
    }

    setIsLoadingSuggestion(true);
    setError(null);

    try {
      const response = await post<DecisionSuggestion>(
        `/api/admin/automation/suggest-decision/${escrowIdInput}`,
        {}
      );
      setSuggestion(response);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsLoadingSuggestion(false);
    }
  };

  // Detect anomalies
  const detectAnomalies = async () => {
    if (!anomaliesEscrowId) {
      setError({
        kind: "VALIDATION",
        title: "Error",
        message: "Please enter an escrow ID",
        retryable: false,
        correlationId: null,
        status: 400,
      });
      return;
    }

    setIsLoadingAnomalies(true);
    setError(null);

    try {
      const response = await get<any>(`/api/admin/automation/detect-anomalies/${anomaliesEscrowId}`);
      setAnomalies(response.anomalies || []);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsLoadingAnomalies(false);
    }
  };

  // Load rules
  const loadRules = useCallback(async () => {
    setIsLoadingRules(true);
    setError(null);

    try {
      const response = await get<any>("/api/admin/automation/rules");
      setRules(response.items || []);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsLoadingRules(false);
    }
  }, [get]);

  // Create rule
  const createRule = async () => {
    if (!ruleForm.rule_name) {
      setError({
        kind: "VALIDATION",
        title: "Error",
        message: "Rule name is required",
        retryable: false,
        correlationId: null,
        status: 400,
      });
      return;
    }

    try {
      const response = await post<any>("/api/admin/automation/rules", ruleForm);
      setRules([response, ...rules]);
      setRuleForm({
        rule_name: "",
        condition_type: "FRAUD_SCORE",
        condition_value: 70,
        action: "HOLD",
      });
      setShowRuleForm(false);
      setSuccessMessage("Rule created successfully");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(normalizeApiError(err));
    }
  };

  // Toggle rule
  const toggleRule = async (ruleId: string, enabled: boolean) => {
    try {
      await patch<any>(`/api/admin/automation/rules/${ruleId}`, {
        enabled: !enabled,
      });

      setRules(
        rules.map((r) => (r.id === ruleId ? { ...r, enabled: !r.enabled } : r))
      );
      setSuccessMessage("Rule updated successfully");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(normalizeApiError(err));
    }
  };

  // Delete rule
  const deleteRule = async (ruleId: string) => {
    if (!confirm("Are you sure you want to delete this rule?")) return;

    try {
      await deleteReq<any>(`/api/admin/automation/rules/${ruleId}`);
      setRules(rules.filter((r) => r.id !== ruleId));
      setSuccessMessage("Rule deleted successfully");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(normalizeApiError(err));
    }
  };

  // Load stats
  const loadStats = useCallback(async () => {
    setIsLoadingStats(true);
    setError(null);

    try {
      const response = await get<any>("/api/admin/automation/stats?days=7");
      setStats(response);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsLoadingStats(false);
    }
  }, [get]);

  useEffect(() => {
    if (activeTab === "rules" && rules.length === 0) {
      loadRules();
    }
  }, [activeTab, rules.length, loadRules]);

  useEffect(() => {
    if (activeTab === "stats") {
      loadStats();
    }
  }, [activeTab, loadStats]);

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
            You don't have permission to access automation features.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-full flex-col gap-6 px-4 py-6 sm:px-8 lg:px-10">
      <header className="panel p-6">
        <h1 className="heading-1">Automation & AI Integration</h1>
        <p className="mt-2 text-sm text-(--ink-muted)">
          AI-powered decision suggestions, anomaly detection, and automation rules.
        </p>
      </header>

      {error && (
        <section className="panel-outline p-5 text-sm text-(--ink-muted)">
          <p className="font-semibold text-foreground">{error.title}</p>
          <p className="mt-1">{error.message}</p>
        </section>
      )}

      {successMessage && (
        <section className="panel-success p-5 text-sm">
          <p className="font-semibold">{successMessage}</p>
        </section>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-(--ink-border)">
        <button
          className={`px-4 py-3 text-sm font-semibold transition-colors ${
            activeTab === "suggestions"
              ? "border-b-2 border-(--action) text-(--action)"
              : "text-(--ink-muted) hover:text-foreground"
          }`}
          onClick={() => setActiveTab("suggestions")}
          type="button"
        >
          Decision Suggestions
        </button>
        <button
          className={`px-4 py-3 text-sm font-semibold transition-colors ${
            activeTab === "anomalies"
              ? "border-b-2 border-(--action) text-(--action)"
              : "text-(--ink-muted) hover:text-foreground"
          }`}
          onClick={() => setActiveTab("anomalies")}
          type="button"
        >
          Anomaly Detection
        </button>
        <button
          className={`px-4 py-3 text-sm font-semibold transition-colors ${
            activeTab === "rules"
              ? "border-b-2 border-(--action) text-(--action)"
              : "text-(--ink-muted) hover:text-foreground"
          }`}
          onClick={() => setActiveTab("rules")}
          type="button"
        >
          Automation Rules
        </button>
        <button
          className={`px-4 py-3 text-sm font-semibold transition-colors ${
            activeTab === "stats"
              ? "border-b-2 border-(--action) text-(--action)"
              : "text-(--ink-muted) hover:text-foreground"
          }`}
          onClick={() => setActiveTab("stats")}
          type="button"
        >
          Statistics
        </button>
      </div>

      {/* Decision Suggestions Tab */}
      {activeTab === "suggestions" && (
        <section className="space-y-6">
          <div className="panel p-6">
            <h2 className="heading-2">AI Decision Suggestion</h2>

            <div className="mt-6 flex gap-2">
              <input
                className="input-field flex-1 text-sm"
                type="text"
                placeholder="Enter escrow ID"
                aria-label="Escrow ID for decision suggestion"
                value={escrowIdInput}
                onChange={(e) => setEscrowIdInput(e.target.value)}
              />
              <button
                className="btn-primary px-4 py-2 text-sm disabled:opacity-60"
                onClick={generateSuggestion}
                disabled={isLoadingSuggestion}
                type="button"
              >
                {isLoadingSuggestion ? "Analyzing..." : "Analyze"}
              </button>
            </div>

            {suggestion && (
              <div className="mt-6 space-y-4">
                <div className="rounded-lg bg-(--surface-soft) p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>

                      <p className="mt-1 text-2xl font-bold text-foreground">
                        {suggestion.suggested_decision}
                      </p>
                    </div>
                    <div>

                      <p className={`mt-1 text-2xl font-bold ${
                        suggestion.confidence >= 80
                          ? "text-(--success)"
                          : suggestion.confidence >= 60
                          ? "text-(--warn)"
                          : "text-(--danger)"
                      }`}>
                        {suggestion.confidence}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-(--surface-soft) p-4">
                  <p className="font-semibold text-foreground">Reasoning</p>
                  <p className="mt-2 text-sm text-(--ink-muted)">{suggestion.reasoning}</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg bg-(--surface-soft) p-4">
                    <p className="font-semibold text-foreground">Key Factors</p>
                    <ul className="mt-2 space-y-1">
                      {suggestion.key_factors.map((factor, idx) => (
                        <li key={idx} className="text-xs text-(--ink-muted)">
                          • {factor}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-lg bg-(--danger-soft) p-4">
                    <p className="font-semibold text-(--danger)">Risk Indicators</p>
                    <ul className="mt-2 space-y-1">
                      {suggestion.risk_indicators.length > 0 ? (
                        suggestion.risk_indicators.map((risk, idx) => (
                          <li key={idx} className="text-xs text-(--danger)">
                            ⚠️ {risk}
                          </li>
                        ))
                      ) : (
                        <li className="text-xs text-(--success)">✓ No major risks detected</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Anomalies Tab */}
      {activeTab === "anomalies" && (
        <section className="space-y-6">
          <div className="panel p-6">
            <h2 className="heading-2">Anomaly Detection</h2>

            <div className="mt-6 flex gap-2">
              <input
                className="input-field flex-1 text-sm"
                type="text"
                placeholder="Enter escrow ID"
                aria-label="Escrow ID for anomaly detection"
                value={anomaliesEscrowId}
                onChange={(e) => setAnomaliesEscrowId(e.target.value)}
              />
              <button
                className="btn-primary px-4 py-2 text-sm disabled:opacity-60"
                onClick={detectAnomalies}
                disabled={isLoadingAnomalies}
                type="button"
              >
                {isLoadingAnomalies ? "Scanning..." : "Scan"}
              </button>
            </div>

            {anomalies.length > 0 && (
              <div className="mt-6 space-y-3">
                {anomalies.map((anomaly, idx) => (
                  <div
                    key={idx}
                    className={`rounded-lg p-4 ${
                      anomaly.severity === "CRITICAL"
                        ? "bg-(--danger-soft)"
                        : anomaly.severity === "HIGH"
                        ? "bg-(--warn-soft)"
                        : anomaly.severity === "MEDIUM"
                        ? "bg-(--surface-soft)"
                        : "bg-(--surface-soft)"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p
                          className={`font-semibold ${
                            anomaly.severity === "CRITICAL" || anomaly.severity === "HIGH"
                              ? "text-(--danger)"
                              : "text-foreground"
                          }`}
                        >
                          {anomaly.anomaly_type}
                        </p>
                        <p className="mt-1 text-sm text-(--ink-muted)">{anomaly.description}</p>
                        <p className="mt-2 text-xs font-semibold text-foreground">
                          Recommended: {anomaly.recommended_action}
                        </p>
                      </div>
                      <span
                        className={`rounded px-2 py-1 text-xs font-semibold ${
                          anomaly.severity === "CRITICAL"
                            ? "bg-(--danger) text-(--danger-ink)"
                            : anomaly.severity === "HIGH"
                            ? "bg-(--warn) text-(--warn-ink)"
                            : "bg-(--ink-muted) text-foreground"
                        }`}
                      >
                        {anomaly.severity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {anomalies.length === 0 && anomaliesEscrowId && !isLoadingAnomalies && (
              <p className="mt-6 text-center text-sm text-(--success)">✓ No anomalies detected</p>
            )}
          </div>
        </section>
      )}

      {/* Rules Tab */}
      {activeTab === "rules" && (
        <section className="space-y-6">
          {showRuleForm && isSuperAdmin ? (
            <div className="panel p-6">
              <div className="flex items-center justify-between gap-4">
                <h2 className="heading-2">Create Automation Rule</h2>
                <button
                  className="btn-outline text-xs px-3 py-2"
                  onClick={() => setShowRuleForm(false)}
                  type="button"
                >
                  Cancel
                </button>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground">Rule Name</label>
                  <input
                    className="input-field mt-2 text-sm"
                    type="text"
                    placeholder="e.g., Auto-refund high fraud score"
                    aria-label="Rule name"
                    value={ruleForm.rule_name}
                    onChange={(e) =>
                      setRuleForm({ ...ruleForm, rule_name: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground">Condition Type</label>
                  <select
                    className="select-field mt-2 text-sm"
                    value={ruleForm.condition_type}
                    onChange={(e) =>
                      setRuleForm({ ...ruleForm, condition_type: e.target.value })
                    }
                    aria-label="Condition type"
                  >
                    <option value="FRAUD_SCORE">Fraud Score</option>
                    <option value="SELLER_RISK">Seller Risk</option>
                    <option value="AMOUNT">Transaction Amount</option>
                    <option value="VELOCITY">Transaction Velocity</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground">Condition Value</label>
                  <input
                    className="input-field mt-2 text-sm"
                    type="number"
                    aria-label="Condition value"
                    value={ruleForm.condition_value}
                    onChange={(e) =>
                      setRuleForm({
                        ...ruleForm,
                        condition_value: parseInt(e.target.value),
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground">Action</label>
                  <select
                    className="select-field mt-2 text-sm"
                    value={ruleForm.action}
                    onChange={(e) =>
                      setRuleForm({ ...ruleForm, action: e.target.value })
                    }
                    aria-label="Action to take"
                  >
                    <option value="AUTO_APPROVE">Auto Approve</option>
                    <option value="AUTO_REFUND">Auto Refund</option>
                    <option value="ESCALATE">Escalate</option>
                    <option value="HOLD">Hold</option>
                  </select>
                </div>

                <button
                  className="btn-primary px-4 py-2 text-sm"
                  onClick={createRule}
                  type="button"
                >
                  Create Rule
                </button>
              </div>
            </div>
          ) : (
            <div className="panel p-6">
              <div className="flex items-center justify-between gap-4">
                <h2 className="heading-2">Automation Rules</h2>
                {isSuperAdmin && (
                  <button
                    className="btn-primary px-4 py-2 text-sm"
                    onClick={() => setShowRuleForm(true)}
                    type="button"
                  >
                    New Rule
                  </button>
                )}
              </div>

              {isLoadingRules ? (
                <p className="mt-6 text-center text-sm text-(--ink-muted)">Loading rules...</p>
              ) : rules.length > 0 ? (
                <div className="mt-6 space-y-3">
                  {rules.map((rule) => (
                    <div key={rule.id} className="rounded-lg border border-(--ink-border) p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">{rule.rule_name}</p>
                          <p className="mt-1 text-sm text-(--ink-muted)">
                            {rule.condition_type} ≥ {rule.condition_value}
                          </p>
                          <p className="mt-1 text-xs font-semibold text-foreground">
                            Action: {rule.action}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {isSuperAdmin && (
                            <>
                              <button
                                className={`px-3 py-2 text-xs font-semibold rounded transition-colors ${
                                  rule.enabled
                                    ? "bg-(--action) text-(--action-ink)"
                                    : "bg-(--surface-soft) text-foreground"
                                }`}
                                onClick={() => toggleRule(rule.id, rule.enabled)}
                                type="button"
                              >
                                {rule.enabled ? "Enabled" : "Disabled"}
                              </button>
                              <button
                                className="btn-outline px-3 py-2 text-xs text-(--danger)"
                                onClick={() => deleteRule(rule.id)}
                                type="button"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-6 text-center text-sm text-(--ink-muted)">
                  No automation rules configured
                </p>
              )}
            </div>
          )}
        </section>
      )}

      {/* Stats Tab */}
      {activeTab === "stats" && (
        <section className="space-y-6">
          <div className="panel p-6">
            <h2 className="heading-2">Automation Statistics (Last 7 Days)</h2>

            {isLoadingStats ? (
              <p className="mt-6 text-center text-sm text-(--ink-muted)">Loading statistics...</p>
            ) : stats ? (
              <div className="mt-6 space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg bg-(--surface-soft) p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-(--ink-soft)">
                      Total Automated Actions
                    </p>
                    <p className="mt-2 text-3xl font-bold text-foreground">
                      {stats.total_automated_actions}
                    </p>
                  </div>

                  <div className="rounded-lg bg-(--success-soft) p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-(--success)">
                      Total Value Processed
                    </p>
                    <p className="mt-2 text-3xl font-bold text-(--success)">
                      ₦{(stats.total_value_processed / 1000000).toFixed(2)}M
                    </p>
                  </div>
                </div>

                <div className="rounded-lg bg-(--surface-soft) p-4">
                  <p className="font-semibold text-foreground">Actions Breakdown</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {Object.entries(stats.actions_breakdown || {}).map(([action, count]: [string, any]) => (
                      <div key={action} className="flex justify-between rounded-lg bg-background p-3">
                        <span className="text-sm text-foreground">{action}</span>
                        <span className="font-bold text-(--action)">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </section>
      )}
    </main>
  );
}
