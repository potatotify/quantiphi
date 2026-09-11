"use client";

import { useEffect, useState } from "react";

import { ErrorBanner } from "@/components/ErrorBanner";
import { EmptyState, Panel, SectionHeading, Skeleton } from "@/components/ui/Panel";
import { requestFavorites } from "@/lib/api/favorites";
import type { CurrencyCode, FavoritePairResponse } from "@/lib/types/currency";

interface FavoritesListProps {
  from: CurrencyCode;
  to: CurrencyCode;
  refreshKey?: string | null;
  onSelect: (from: CurrencyCode, to: CurrencyCode) => void;
}

export function FavoritesList({ from, to, refreshKey, onSelect }: FavoritesListProps) {
  const [favorites, setFavorites] = useState<FavoritePairResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadFavorites();
  }, [refreshKey]);

  async function loadFavorites() {
    setLoading(true);
    setError(null);

    try {
      setFavorites(await requestFavorites());
    } catch (favoritesError) {
      setError(
        favoritesError instanceof Error ? favoritesError.message : "Unable to load favorites.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Panel aria-label="Favorite currency pairs">
      <SectionHeading
        title="Favorites"
        description="Frequent pairs, ranked by how often you convert them."
      />

      {error ? <ErrorBanner message={error} /> : null}

      {loading ? (
        <div className="space-y-2" role="status" aria-label="Loading favorites">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-3/4" />
        </div>
      ) : null}

      {!loading && !error && favorites.length === 0 ? (
        <EmptyState
          title="No frequent pairs yet"
          description="Convert a pair to add it here. The most-used pairs stay at the top."
        />
      ) : null}

      {!loading && favorites.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {favorites.map((favorite) => {
            const selected = favorite.from === from && favorite.to === to;

            return (
              <li key={favorite.id}>
                <button
                  type="button"
                  onClick={() => onSelect(favorite.from, favorite.to)}
                  aria-pressed={selected}
                  aria-label={`Use favorite pair ${favorite.from} to ${favorite.to}`}
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                    selected
                      ? "border-sky-400 bg-sky-400/10 text-sky-100"
                      : "border-slate-800 bg-slate-950/70 text-slate-100 hover:border-slate-600"
                  }`}
                >
                  <span className="text-sm font-medium">
                    {favorite.from} → {favorite.to}
                  </span>
                  <span className="text-xs text-slate-400">
                    Used {favorite.usageCount} {favorite.usageCount === 1 ? "time" : "times"}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </Panel>
  );
}
