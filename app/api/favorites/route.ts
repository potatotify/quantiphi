import { NextResponse } from "next/server";

import {
  createFavorite,
  listFavorites,
  parseFavoriteRequest,
} from "@/lib/services/favorites";
import type { ApiErrorResponse, FavoritePairResponse } from "@/lib/types/currency";
import { ValidationError } from "@/lib/validation/currency";

export async function GET() {
  try {
    const favorites = await listFavorites();
    return NextResponse.json<FavoritePairResponse[]>(favorites, { status: 200 });
  } catch {
    return errorResponse("Unable to load favorites.", 500);
  }
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return errorResponse("Request body must be valid JSON.", 400);
  }

  try {
    const pair = parseFavoriteRequest(body);
    const favorite = await createFavorite(pair.from, pair.to);
    return NextResponse.json<FavoritePairResponse>(favorite, { status: favorite.usageCount === 1 ? 201 : 200 });
  } catch (error) {
    return handleFavoriteError(error);
  }
}

function handleFavoriteError(error: unknown) {
  if (error instanceof ValidationError) {
    return errorResponse(error.message, 400);
  }

  return errorResponse("Unable to save the favorite pair.", 500);
}

function errorResponse(error: string, status: number) {
  return NextResponse.json<ApiErrorResponse>({ error }, { status });
}
