import { ApiClientError } from "./errors";
import type { ApiErrorPayload, ApiMethod, ApiRequestOptions } from "./types";

const WRITE_METHODS: ApiMethod[] = ["POST", "PUT", "PATCH", "DELETE"];

function getApiBaseUrl(): string {
  const rawBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

  if (!rawBaseUrl) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured.");
  }

  return rawBaseUrl.replace(/\/$/, "");
}

function buildUrl(path: string): string {
  if (/^https?:\/\//.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getApiBaseUrl()}${normalizedPath}`;
}

function createRequestId(prefix: string): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`;
}

async function parseErrorPayload(response: Response): Promise<ApiErrorPayload | null> {
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    return null;
  }

  try {
    const data = (await response.json()) as ApiErrorPayload;
    return data;
  } catch {
    return null;
  }
}

async function parseSuccessPayload<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

function buildHeaders(
  method: ApiMethod,
  options: ApiRequestOptions,
  hasBody: boolean,
): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.headers ?? {}),
  };

  const isWrite = WRITE_METHODS.includes(method);

  if (hasBody && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (isWrite) {
    headers["X-Correlation-Id"] =
      options.correlationId ?? headers["X-Correlation-Id"] ?? createRequestId("corr");

    const shouldIncludeIdempotency = options.includeIdempotencyKey ?? true;
    if (shouldIncludeIdempotency) {
      headers["X-Idempotency-Key"] =
        options.idempotencyKey ??
        headers["X-Idempotency-Key"] ??
        createRequestId("idem");
    }
  }

  if (options.authToken && !headers.Authorization) {
    headers.Authorization = `Bearer ${options.authToken}`;
  }

  return headers;
}

export async function apiRequest<TResponse, TBody = unknown>(
  path: string,
  options: ApiRequestOptions<TBody> = {},
): Promise<TResponse> {
  const method = options.method ?? "GET";
  const hasBody = options.body !== undefined;
  const headers = buildHeaders(method, options, hasBody);

  const response = await fetch(buildUrl(path), {
    method,
    headers,
    body: hasBody ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
    cache: "no-store",
  });

  if (!response.ok) {
    const payload = await parseErrorPayload(response);
    throw new ApiClientError(response.status, payload);
  }

  return parseSuccessPayload<TResponse>(response);
}

export const apiClient = {
  get: <TResponse>(path: string, options?: Omit<ApiRequestOptions, "method">) =>
    apiRequest<TResponse>(path, { ...options, method: "GET" }),
  post: <TResponse, TBody = unknown>(
    path: string,
    body?: TBody,
    options?: Omit<ApiRequestOptions<TBody>, "method" | "body">,
  ) => apiRequest<TResponse, TBody>(path, { ...options, method: "POST", body }),
  put: <TResponse, TBody = unknown>(
    path: string,
    body?: TBody,
    options?: Omit<ApiRequestOptions<TBody>, "method" | "body">,
  ) => apiRequest<TResponse, TBody>(path, { ...options, method: "PUT", body }),
  patch: <TResponse, TBody = unknown>(
    path: string,
    body?: TBody,
    options?: Omit<ApiRequestOptions<TBody>, "method" | "body">,
  ) => apiRequest<TResponse, TBody>(path, { ...options, method: "PATCH", body }),
  delete: <TResponse>(path: string, options?: Omit<ApiRequestOptions, "method">) =>
    apiRequest<TResponse>(path, { ...options, method: "DELETE" }),
};
