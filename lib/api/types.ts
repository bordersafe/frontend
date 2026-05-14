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
