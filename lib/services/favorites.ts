import "server-only";

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import type { CurrencyCode, FavoritePairResponse } from "@/lib/types/currency";
import { parseCurrencyPair, parseJsonObject, ValidationError } from "@/lib/validation/currency";

export class DuplicateFavoriteError extends Error {
  constructor() {
    super("This currency pair is already in favorites.");
    this.name = "DuplicateFavoriteError";
  }
}

export class FavoriteNotFoundError extends Error {
  constructor() {
    super("Favorite pair not found.");
    this.name = "FavoriteNotFoundError";
  }
}

export function parseFavoriteRequest(body: unknown) {
  const payload = parseJsonObject(body);
  return parseCurrencyPair(payload.from, payload.to);
}

export async function listFavorites(): Promise<FavoritePairResponse[]> {
  await syncUsageFromHistory();

  const favorites = await prisma.favoritePair.findMany({
    orderBy: [{ usageCount: "desc" }, { lastUsedAt: "desc" }, { createdAt: "desc" }],
  });

  return favorites.map(toFavoriteResponse);
}

async function syncUsageFromHistory() {
  const grouped = await prisma.conversionHistory.groupBy({
    by: ["baseCurrency", "targetCurrency"],
    _count: { id: true },
    _max: { createdAt: true },
  });

  await Promise.all(
    grouped.map((row) =>
      prisma.favoritePair.upsert({
        where: {
          baseCurrency_targetCurrency: {
            baseCurrency: row.baseCurrency,
            targetCurrency: row.targetCurrency,
          },
        },
        create: {
          baseCurrency: row.baseCurrency,
          targetCurrency: row.targetCurrency,
          usageCount: row._count.id,
          lastUsedAt: row._max.createdAt,
        },
        update: {
          usageCount: row._count.id,
          lastUsedAt: row._max.createdAt,
        },
      }),
    ),
  );
}

export async function recordFavoriteUsage(
  from: CurrencyCode,
  to: CurrencyCode,
): Promise<FavoritePairResponse> {
  const now = new Date();
  const favorite = await prisma.favoritePair.upsert({
    where: {
      baseCurrency_targetCurrency: {
        baseCurrency: from,
        targetCurrency: to,
      },
    },
    create: {
      baseCurrency: from,
      targetCurrency: to,
      usageCount: 1,
      lastUsedAt: now,
    },
    update: {
      usageCount: { increment: 1 },
      lastUsedAt: now,
    },
  });

  return toFavoriteResponse(favorite);
}

export async function createFavorite(
  from: CurrencyCode,
  to: CurrencyCode,
): Promise<FavoritePairResponse> {
  const existing = await prisma.favoritePair.findUnique({
    where: {
      baseCurrency_targetCurrency: {
        baseCurrency: from,
        targetCurrency: to,
      },
    },
  });

  if (existing) {
    throw new DuplicateFavoriteError();
  }

  try {
    const favorite = await prisma.favoritePair.create({
      data: {
        baseCurrency: from,
        targetCurrency: to,
        usageCount: 1,
        lastUsedAt: new Date(),
      },
    });

    return toFavoriteResponse(favorite);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new DuplicateFavoriteError();
    }

    throw error;
  }
}

export async function deleteFavorite(id: string): Promise<{ id: string }> {
  if (typeof id !== "string" || id.trim() === "") {
    throw new ValidationError("Favorite id is required.");
  }

  const favoriteId = id.trim();

  if (favoriteId.length > 64) {
    throw new ValidationError("Favorite id is invalid.");
  }

  try {
    const favorite = await prisma.favoritePair.delete({
      where: { id: favoriteId },
    });

    return { id: favorite.id };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      throw new FavoriteNotFoundError();
    }

    throw error;
  }
}

function toFavoriteResponse(favorite: {
  id: string;
  baseCurrency: string;
  targetCurrency: string;
  usageCount: number;
  lastUsedAt: Date | null;
  createdAt: Date;
}): FavoritePairResponse {
  return {
    id: favorite.id,
    from: favorite.baseCurrency,
    to: favorite.targetCurrency,
    usageCount: favorite.usageCount,
    lastUsedAt: favorite.lastUsedAt?.toISOString() ?? null,
    createdAt: favorite.createdAt.toISOString(),
  };
}

