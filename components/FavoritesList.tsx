"use client";

import { useEffect, useState } from "react";

import { ErrorBanner } from "@/components/ErrorBanner";
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
    <section
      aria-label="Favorite currency pairs"
      className="rounded-3xl border border-slate-800 bg-slate-900/40 p-5 shadow-xl shadow-slate-950/40 sm:p-8"
    >
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-100">Favorites</h2>
        <p className="mt-1 text-sm text-slate-400">
          Frequent pairs, ranked by how often you convert them.
        </p>
      </div>

      {error ? <ErrorBanner message={error} /> : null}

      {loading ? (
        <p className="text-sm text-slate-400" role="status">
          Loading favorites…
        </p>
      ) : null}

      {!loading && favorites.length === 0 ? (
        <p className="text-sm text-slate-400">
          Convert a pair to add it here. The most-used pairs stay at the top.
        </p>
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
                  className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                    selected
                      ? "border-sky-400 bg-sky-400/10 text-sky-200"
                      : "border-slate-800 bg-slate-950/50 text-slate-100 hover:border-slate-600"
                  }`}
                >
                  <span className="block text-sm font-medium">
                    {favorite.from} → {favorite.to}
                  </span>
                  <span className="mt-1 block text-xs text-slate-400">
                    Used {favorite.usageCount} {favorite.usageCount === 1 ? "time" : "times"}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}
