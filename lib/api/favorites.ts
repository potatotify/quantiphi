import { readApiJson } from "@/lib/api/http";
import type { CurrencyCode, FavoritePairResponse } from "@/lib/types/currency";

export async function requestFavorites(): Promise<FavoritePairResponse[]> {
  const response = await fetch("/api/favorites", {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  return readApiJson<FavoritePairResponse[]>(response, "Unable to load favorites.");
}

export async function requestCreateFavorite(
  from: CurrencyCode,
  to: CurrencyCode,
): Promise<FavoritePairResponse> {
  const response = await fetch("/api/favorites", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to }),
  });

  return readApiJson<FavoritePairResponse>(response, "Unable to save the favorite pair.");
}

export async function requestDeleteFavorite(id: string): Promise<{ id: string }> {
  const response = await fetch(`/api/favorites/${id}`, {
    method: "DELETE",
    headers: { Accept: "application/json" },
  });

  return readApiJson<{ id: string }>(response, "Unable to delete the favorite pair.");
}
