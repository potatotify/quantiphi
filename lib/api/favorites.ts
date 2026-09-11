import type { ApiErrorResponse, CurrencyCode, FavoritePairResponse } from "@/lib/types/currency";

export async function requestFavorites(): Promise<FavoritePairResponse[]> {
  const response = await fetch("/api/favorites", {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  return readJson<FavoritePairResponse[]>(response, "Unable to load favorites.");
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

  return readJson<FavoritePairResponse>(response, "Unable to save the favorite pair.");
}

export async function requestDeleteFavorite(id: string): Promise<{ id: string }> {
  const response = await fetch(`/api/favorites/${id}`, {
    method: "DELETE",
    headers: { Accept: "application/json" },
  });

  return readJson<{ id: string }>(response, "Unable to delete the favorite pair.");
}

async function readJson<T>(response: Response, fallback: string): Promise<T> {
  let data: T | ApiErrorResponse;

  try {
    data = (await response.json()) as T | ApiErrorResponse;
  } catch {
    throw new Error("The favorites list could not read the server response.");
  }

  if (!response.ok || (typeof data === "object" && data !== null && "error" in data)) {
    throw new Error(
      typeof data === "object" && data !== null && "error" in data ? data.error : fallback,
    );
  }

  return data;
}
