import { NextResponse } from "next/server";

import { toErrorResponse } from "@/lib/http/errors";
import { deleteFavorite } from "@/lib/services/favorites";

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const deleted = await deleteFavorite(params.id);
    return NextResponse.json(deleted, { status: 200 });
  } catch (error) {
    return toErrorResponse(error, "Unable to delete the favorite pair.");
  }
}
