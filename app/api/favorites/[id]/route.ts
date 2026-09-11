import { NextResponse } from "next/server";

import { deleteFavorite, FavoriteNotFoundError } from "@/lib/services/favorites";
import type { ApiErrorResponse } from "@/lib/types/currency";
import { ValidationError } from "@/lib/validation/currency";

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const deleted = await deleteFavorite(params.id);
    return NextResponse.json(deleted, { status: 200 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return errorResponse(error.message, 400);
    }

    if (error instanceof FavoriteNotFoundError) {
      return errorResponse(error.message, 404);
    }

    return errorResponse("Unable to delete the favorite pair.", 500);
  }
}

function errorResponse(error: string, status: number) {
  return NextResponse.json<ApiErrorResponse>({ error }, { status });
}
