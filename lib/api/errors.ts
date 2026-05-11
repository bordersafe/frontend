import type { ApiErrorPayload, UiError, UiErrorKind } from "./types";

export class ApiClientError extends Error {
  public readonly status: number;
  public readonly payload: ApiErrorPayload | null;

  constructor(status: number, payload: ApiErrorPayload | null, message?: string) {
    super(message ?? payload?.message ?? "API request failed");
    this.name = "ApiClientError";
    this.status = status;
    this.payload = payload;
  }
}

function inferErrorKind(status: number, code?: string): UiErrorKind {
  if (status === 0) {
    return "NETWORK";
  }

  if (status === 400 || status === 422) {
    return "VALIDATION";
  }

  if (status === 401 || status === 403) {
    return "AUTH";
  }

  if (status === 409 || code === "INVALID_STATE_TRANSITION") {
    return "STATE_TRANSITION";
  }

  if (status >= 500) {
    return "SERVER";
  }

  return "UNKNOWN";
}

function kindToTitle(kind: UiErrorKind): string {
  if (kind === "NETWORK") return "Network issue";
  if (kind === "VALIDATION") return "Validation failed";
  if (kind === "AUTH") return "Permission required";
  if (kind === "STATE_TRANSITION") return "Action not allowed";
  if (kind === "SERVER") return "Server error";
  return "Request failed";
}

export function normalizeApiError(error: unknown): UiError {
  if (error instanceof ApiClientError) {
    const payload = error.payload;
    const kind = inferErrorKind(error.status, payload?.code);

    return {
      kind,
      title: kindToTitle(kind),
      message:
        payload?.message ??
        (error.status >= 500
          ? "Something went wrong on our side. Please try again."
          : "Unable to complete that request."),
      retryable: kind === "NETWORK" || kind === "SERVER",
      correlationId: payload?.correlation_id ?? null,
      status: error.status,
      code: payload?.code,
      details: payload?.details,
    };
  }

  if (error instanceof Error) {
    return {
      kind: "NETWORK",
      title: kindToTitle("NETWORK"),
      message: error.message || "Network request failed.",
      retryable: true,
      correlationId: null,
      status: 0,
    };
  }

  return {
    kind: "UNKNOWN",
    title: kindToTitle("UNKNOWN"),
    message: "An unexpected error occurred.",
    retryable: false,
    correlationId: null,
    status: null,
  };
}
