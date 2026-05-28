"use client";

import { useCallback, useMemo } from "react";
import useSWR from "swr";

import { getIdToken, useAuth } from "../auth";
import { apiClient } from "./client";
import type { UserProfile } from "./types";

export function useAuthedApi() {
  const { user, profile: authProfile, isLoading } = useAuth();

  const withAuthOptions = useCallback(async () => {
    const token = await getIdToken(user);
    return { authToken: token ?? undefined };
  }, [user]);

  const { data: liveProfile } = useSWR<UserProfile>(
    user ? ["auth-profile", user.uid] : null,
    async () => apiClient.get<UserProfile>("/api/auth/me", await withAuthOptions()),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      shouldRetryOnError: false,
    },
  );

  const api = useMemo(
    () => ({
      get: async <TResponse,>(path: string) =>
        apiClient.get<TResponse>(path, await withAuthOptions()),
      post: async <TResponse, TBody = unknown>(path: string, body?: TBody) =>
        apiClient.post<TResponse, TBody>(path, body, await withAuthOptions()),
      put: async <TResponse, TBody = unknown>(path: string, body?: TBody) =>
        apiClient.put<TResponse, TBody>(path, body, await withAuthOptions()),
      patch: async <TResponse, TBody = unknown>(path: string, body?: TBody) =>
        apiClient.patch<TResponse, TBody>(path, body, await withAuthOptions()),
      delete: async <TResponse,>(path: string) =>
        apiClient.delete<TResponse>(path, await withAuthOptions()),
    }),
    [withAuthOptions]
  );

  return {
    isAuthLoading: isLoading,
    user,
    profile: liveProfile ?? authProfile,
    ...api,
  };
}

export type { UserProfile };
