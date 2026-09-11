import { NextResponse } from "next/server";

import { readJsonBody, toErrorResponse } from "@/lib/http/errors";
import { createFavorite, listFavorites, parseFavoriteRequest } from "@/lib/services/favorites";
import type { FavoritePairResponse } from "@/lib/types/currency";

export async function GET() {
  try {
    const favorites = await listFavorites();
    return NextResponse.json<FavoritePairResponse[]>(favorites, { status: 200 });
  } catch (error) {
    return toErrorResponse(error, "Unable to load favorites.");
  }
}

export async function POST(request: Request) {
  try {
    const pair = parseFavoriteRequest(await readJsonBody(request));
    const favorite = await createFavorite(pair.from, pair.to);
    return NextResponse.json<FavoritePairResponse>(favorite, { status: 201 });
  } catch (error) {
    return toErrorResponse(error, "Unable to save the favorite pair.");
  }
}
