"use client";

import { getIdToken, useAuth, type UserProfile } from "../auth";
import { apiClient } from "./client";

export function useAuthedApi() {
  const { user, profile, isLoading } = useAuth();

  const withAuthOptions = async () => {
    const token = await getIdToken(user);
    return { authToken: token ?? undefined };
  };

  return {
    isAuthLoading: isLoading,
    user,
    profile,
    get: async <TResponse>(path: string) =>
      apiClient.get<TResponse>(path, await withAuthOptions()),
    post: async <TResponse, TBody = unknown>(path: string, body?: TBody) =>
      apiClient.post<TResponse, TBody>(path, body, await withAuthOptions()),
    put: async <TResponse, TBody = unknown>(path: string, body?: TBody) =>
      apiClient.put<TResponse, TBody>(path, body, await withAuthOptions()),
    patch: async <TResponse, TBody = unknown>(path: string, body?: TBody) =>
      apiClient.patch<TResponse, TBody>(path, body, await withAuthOptions()),
    delete: async <TResponse>(path: string) =>
      apiClient.delete<TResponse>(path, await withAuthOptions()),
  };
}

export type { UserProfile };
