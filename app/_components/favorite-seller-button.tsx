"use client";

import useSWR from "swr";

import { useAuthedApi } from "@/lib/api/auth-client";
import type { BuyerFavoritesResponse } from "@/lib/api";

type FavoriteSellerButtonProps = {
  sellerId: string;
  className?: string;
};

export function FavoriteSellerButton({ sellerId, className }: FavoriteSellerButtonProps) {
  const { user, isAuthLoading, get, post } = useAuthedApi();

  const { data, mutate, isLoading } = useSWR<BuyerFavoritesResponse>(
    !isAuthLoading && user ? ["buyer-favorites-shared", user.uid] : null,
    async () => get<BuyerFavoritesResponse>("/api/escrow/buyer/favorites"),
    { revalidateOnFocus: false }
  );

  if (!sellerId) {
    return null;
  }

  if (!isAuthLoading && !user) {
    return null;
  }

  const favorites = data?.items ?? [];
  const isFavorited = favorites.some((item) => item.seller_id === sellerId);

  const handleToggle = async () => {
    try {
      await post("/api/escrow/buyer/favorites", {
        seller_id: sellerId,
        favorited: !isFavorited,
      });
      await mutate();
    } catch {
      // Non-blocking toggle failure.
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isLoading}
      className={
        className ??
        "rounded-full border border-(--border-soft) bg-white px-3 py-1 text-xs font-semibold text-foreground hover:border-(--primary)"
      }
      aria-label={isFavorited ? "Remove seller from favorites" : "Add seller to favorites"}
      title={isFavorited ? "Remove from favorites" : "Add to favorites"}
    >
      {isFavorited ? "★ Favorited" : "☆ Add to favorites"}
    </button>
  );
}
