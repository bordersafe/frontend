"use client";

import { type FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { normalizeApiError } from "@/lib/api";
import type { UiError, StoreListResponse, StoreCreateResponse, StoreSummary } from "@/lib/api";
import { useAuthedApi } from "@/lib/api/auth-client";
import { canAccessVendorWorkspace } from "@/lib/roles";

// Use shared StoreSummary from API types

export default function StoreSetupPage() {
  const router = useRouter();
  const { user, profile, isAuthLoading, get, post } = useAuthedApi();
  const [stores, setStores] = useState<StoreSummary[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<UiError | null>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyResult, setVerifyResult] = useState<string | null>(null);
  const canManageStores = canAccessVendorWorkspace(profile?.roles);

  const fetchStores = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await get<StoreListResponse>("/api/stores/mine");
      setStores(response.items ?? []);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [get, user]);

  useEffect(() => {
    if (!isAuthLoading && user) {
      void fetchStores();
    }
  }, [fetchStores, isAuthLoading, user]);

  useEffect(() => {
    if (isAuthLoading || !profile) {
      return;
    }

    if (canManageStores) {
      return;
    }

    if (profile.roles.includes("customer")) {
      router.replace("/buyer");
      return;
    }

    router.replace("/dashboard");
  }, [canManageStores, isAuthLoading, profile, router]);

  const handleVerifyApi = async () => {
    if (!user) return;
    setVerifyLoading(true);
    setVerifyResult(null);
    try {
      const profile = await get<{ roles?: string[] }>("/api/auth/me");
      const storesResp = await get<StoreListResponse>("/api/stores/mine");
      setVerifyResult(JSON.stringify({ profile, stores: storesResp }, null, 2));
    } catch (err) {
      setVerifyResult(String(err));
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await post<StoreCreateResponse, { name: string; slug?: string }>(
        "/api/stores",
        {
          name: name.trim(),
          ...(slug.trim() ? { slug: slug.trim() } : {}),
        }
      );
      setName("");
      setSlug("");
      await fetchStores();
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-full flex-col gap-6 px-4 py-6 sm:px-8 lg:px-10">
      <section className="panel p-6">
        <h1 className="heading-1">Store studio</h1>
        <p className="mt-2 text-sm text-(--ink-muted)">
          Create a store profile to start accepting escrowed payments and invite collaborators.
        </p>
        <div className="mt-3">
          <button
            className="btn-secondary px-3 py-1 text-xs"
            onClick={handleVerifyApi}
            type="button"
            disabled={!user || verifyLoading}
          >
            {verifyLoading ? "Verifying..." : "Verify API"}
          </button>
          {verifyResult && (
            <pre className="mt-2 max-h-40 overflow-auto text-xs bg-(--surface-alt) p-2">{verifyResult}</pre>
          )}
        </div>
        {!isAuthLoading && !user && (
          <p className="mt-3 text-sm text-(--ink-muted)">
            Sign in to manage stores. <Link className="font-semibold text-foreground" href="/auth/login">Sign in</Link>
          </p>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="panel p-5">
          <h2 className="heading-3">Create store</h2>
          <form className="mt-4 grid gap-3" onSubmit={handleSubmit}>
            <input
              className="input-field"
              placeholder="Store name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <input
              className="input-field"
              placeholder="Custom slug (optional)"
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
            />
            <button
              className="btn-primary px-4 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!user || !name.trim() || isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Creating store..." : "Create store"}
            </button>
          </form>
        </section>

        <section className="panel p-5">
          <div className="flex items-center justify-between">
            <h2 className="heading-3">Store list</h2>
            <button
              className="btn-secondary px-3 py-1 text-xs"
              onClick={fetchStores}
              type="button"
            >
              {isLoading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {!user ? (
            <p className="mt-4 text-sm text-(--ink-muted)">Sign in to view your stores.</p>
          ) : stores.length === 0 ? (
            <p className="mt-4 text-sm text-(--ink-muted)">
              {isLoading ? "Loading stores..." : "No stores yet. Create one above."}
            </p>
          ) : (
            <div className="mt-4 grid gap-3">
              {stores.map((store) => (
                <div key={store.id} className="panel-muted px-4 py-3 text-sm text-(--ink-muted)">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-foreground">{store.name}</p>
                    <span className="chip">{store.status}</span>
                  </div>
                  <p className="mt-1 text-xs text-(--ink-soft)">Slug: {store.slug}</p>
                  <p className="mt-1 text-xs text-(--ink-soft)">Role: {store.role}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </section>

      {error && (
        <section className="panel-outline p-5 text-sm text-(--ink-muted)">
          <p className="font-semibold text-foreground">{error.title}</p>
          <p className="mt-1">{error.message}</p>
          {error.correlationId && (
            <p className="mt-2 text-xs text-(--ink-soft)">Correlation ID: {error.correlationId}</p>
          )}
        </section>
      )}
    </main>
  );
}
