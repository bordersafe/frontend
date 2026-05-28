export type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type UiErrorKind =
  | "NETWORK"
  | "VALIDATION"
  | "AUTH"
  | "STATE_TRANSITION"
  | "SERVER"
  | "UNKNOWN";

export interface UiError {
  kind: UiErrorKind;
  title: string;
  message: string;
  retryable: boolean;
  correlationId: string | null;
  status: number | null;
  code?: string;
  details?: unknown;
}

export interface ApiErrorPayload {
  code?: string;
  message?: string;
  details?: unknown;
  correlation_id?: string | null;
}

export interface ApiRequestOptions<TBody = unknown> {
  method?: ApiMethod;
  headers?: Record<string, string>;
  body?: TBody;
  signal?: AbortSignal;
  correlationId?: string;
  idempotencyKey?: string;
  includeIdempotencyKey?: boolean;
  authToken?: string;
}

// Shared frontend API types for user/profile and store objects
export type UserRole = "customer" | "vendor" | "hitl" | "admin" | "super_admin";

export interface UserProfile {
  id: string;
  email: string | null;
  display_name: string | null;
  roles: UserRole[];
  status: "active" | "disabled";
  created_at: string | null;
  updated_at: string | null;
}

export interface StoreSummary {
  id: string;
  name: string;
  slug: string;
  status: string;
  role: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface StoreListResponse {
  count: number;
  items: StoreSummary[];
}

export interface StoreCreateResponse {
  id: string;
  name: string;
  slug: string;
  status: string;
  owner_id: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface EscrowDetail {
  id: string;
  // Optional refund info when an admin issues a refund for this escrow
  refund?: {
    amount: number;
    issued_at: string;
  } | null;
  seller_id?: string;
  transaction_ref: string;
  description: string | null;
  amount: number;
  currency: string;
  buyer_email: string;
  status: string;
  checkout_url: string | null;
  payment_checkout_url?: string | null;
  archived_at?: string | null;
  disabled?: boolean;
  review_deadline_at?: string | null;
  virtual_account?: {
    account_number: string;
    account_name: string | null;
    bank_name: string | null;
    expires_at: string | null;
    reference: string | null;
  } | null;
  waybill: {
    is_valid_waybill: boolean;
    tracking_number: string | null;
    courier: string | null;
    checked_at: string;
  } | null;
  delivery: {
    delivered_at: string;
    source: string;
    notes?: string | null;
  } | null;
  proof: {
    original_product_url: string | null;
    buyer_received_url: string | null;
    uploaded_at: string;
  } | null;
  arbitration: {
    confidence_score: number;
    verdict: "MATCH" | "FRAUD";
    reasoning: string;
    decided_at: string;
  } | null;
  buyer_confirmation: {
    confirmed_at: string;
    notes?: string | null;
  } | null;
  disputes?: Array<{
    id: string;
    initiated_by: "buyer" | "seller";
    reason: string;
    status: "OPEN" | "RESOLVED" | "APPEALED";
    created_at: string;
    responses: Array<{
      from: "buyer" | "seller";
      message: string;
      evidence: string[];
      created_at: string;
    }>;
    admin_decision?: {
      decision: "APPROVE_SELLER" | "APPROVE_BUYER";
      reasoning: string;
      decided_at: string;
      decided_by: string;
    } | null;
    appeal?: {
      reason: string;
      status: "PENDING" | "APPROVED" | "REJECTED";
      created_at: string;
      resolved_at: string | null;
      decision: string | null;
    } | null;
  }>;
  payout: unknown | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface BuyerOrderSummaryResponse {
  active: EscrowDetail[];
  recent: EscrowDetail[];
}

export interface BuyerRetentionMetricsResponse {
  total_purchases: number;
  total_spent: number;
  average_order_value: number;
  disputes_opened: number;
  dispute_win_rate: number;
  refunds_received: number;
  trusted_sellers_count: number;
  account_age_days: number;
  first_purchase_date: string | null;
  last_purchase_date: string | null;
  buyer_tier: "bronze" | "silver" | "gold" | "platinum";
  completion_rate: number;
  safety_score: number;
  repeat_purchase_rate: number;
  retention: {
    day_30: number;
    day_60: number;
    day_90: number;
  };
  dispute_resolution_time_hours_avg: number | null;
  refund_turnaround_time_hours_avg: number | null;
  dispute_reopen_rate: number;
  csat_score: number | null;
  review_completion_rate: number;
  buyer_trust_click_through_rate: number;
  seller_quality_distribution: {
    high: number;
    medium: number;
    low: number;
  };
  ltv_cac_ratio: number | null;
}

export interface BuyerNotificationPreferenceItem {
  id: string;
  enabled: boolean;
}

export interface BuyerNotificationPreferencesResponse {
  items: BuyerNotificationPreferenceItem[];
}

export interface BuyerFavoriteSeller {
  seller_id: string;
  display_name: string;
  average_rating: number;
  badge: string | null;
  response_rate: number;
}

export interface BuyerFavoritesResponse {
  items: BuyerFavoriteSeller[];
}

export interface DisputeCreateRequest {
  reason: string;
  description: string;
  evidence: string[];
}

export interface DisputeDetail {
  id: string;
  escrow_id: string;
  initiated_by: "buyer" | "seller";
  initiated_at: string;
  reason: string;
  description: string;
  evidence: string[];
  status: "OPEN" | "RESOLVED" | "APPEALED";
  created_at: string;
  sla_deadline: string;
  responses: Array<{
    from: "buyer" | "seller";
    message: string;
    evidence: string[];
    created_at: string;
  }>;
  admin_decision?: {
    decision: "APPROVE_SELLER" | "APPROVE_BUYER";
    reasoning: string;
    decided_at: string;
    decided_by: string;
  } | null;
  appeal?: {
    reason: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    created_at: string;
    resolved_at: string | null;
    decision: string | null;
  } | null;
}

export interface DisputeCreateResponse {
  escrow_id: string;
  dispute: DisputeDetail;
}

export interface BankAccount {
  id: string;
  account_number: string;
  account_name: string;
  bank_name: string;
  bank_code: string;
  is_default: boolean;
  verified: boolean;
  created_at: string;
}

export interface BankAccountsListResponse {
  count: number;
  items: BankAccount[];
}

export interface PayoutHistoryItem {
  id: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  amount: number;
  currency: string;
  scheduled_date: string;
  processed_date: string | null;
  bank_account_id: string;
  fee: number;
  reference: string | null;
  created_at: string;
}

export interface PayoutHistoryResponse {
  count: number;
  items: PayoutHistoryItem[];
}

export interface PayoutScheduleResponse {
  next_payout_date: string;
  payout_frequency: "WEEKLY" | "BIWEEKLY" | "MONTHLY";
  total_pending: number;
  recent_payouts: PayoutHistoryItem[];
}

export type SellerBadge =
  | "VERIFIED"
  | "FAST_PAYOUT"
  | "HIGH_RATING"
  | "RESPONSIVE_SELLER";

export interface SellerPublicProfileResponse {
  seller_id: string;
  display_name: string;
  joined_at: string | null;
  badges: SellerBadge[];
  ratings: {
    average: number;
    total: number;
    breakdown: {
      1: number;
      2: number;
      3: number;
      4: number;
      5: number;
    };
    recent: Array<{
      rating: number;
      comment: string | null;
      created_at: string | null;
    }>;
  };
  compliance: {
    kyc_status: "NOT_SUBMITTED" | "PENDING" | "VERIFIED" | "REJECTED";
    compliance_status: "COMPLIANT" | "UNDER_REVIEW" | "FLAGGED";
    verified_at: string | null;
  };
  analytics: {
    rating_trend: Array<{
      period: string;
      average_rating: number;
      total_ratings: number;
    }>;
    rating_trend_direction: "UP" | "DOWN" | "FLAT";
    response_rate_percent: number;
    total_disputes: number;
    responded_disputes: number;
  };
}

export interface SellerRecommendation {
  seller_id: string;
  display_name: string;
  badges: SellerBadge[];
  rating_average: number;
  rating_total: number;
  response_rate_percent: number;
  reason: string;
  trust_score: number;
}

export interface SellerRecommendationsResponse {
  items: SellerRecommendation[];
  meta: {
    current_seller_id: string | null;
    count: number;
  };
}
