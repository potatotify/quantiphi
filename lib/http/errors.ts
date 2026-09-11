import "server-only";

import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { ConfigError } from "@/lib/config/env";
import { ExchangeRateError } from "@/lib/exchange-rate";
import { DuplicateFavoriteError, FavoriteNotFoundError } from "@/lib/services/favorites";
import type { ApiErrorResponse } from "@/lib/types/currency";
import { ValidationError } from "@/lib/validation/currency";

export function jsonError(error: string, status: number) {
  return NextResponse.json<ApiErrorResponse>({ error }, { status });
}

export async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new ValidationError("Request body must be valid JSON.");
  }
}

export function toErrorResponse(error: unknown, fallback: string) {
  if (error instanceof ValidationError) {
    return jsonError(error.message, 400);
  }

  if (error instanceof FavoriteNotFoundError) {
    return jsonError(error.message, 404);
  }

  if (error instanceof DuplicateFavoriteError) {
    return jsonError(error.message, 409);
  }

  if (error instanceof ExchangeRateError) {
    if (error.code === "UNSUPPORTED_CURRENCY") {
      return jsonError(error.message, 400);
    }

    if (error.code === "EMPTY_DATA") {
      return jsonError(error.message, 404);
    }

    return jsonError(error.message, 502);
  }

  if (error instanceof ConfigError) {
    return jsonError(error.message, 500);
  }

  if (isDatabaseError(error)) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return jsonError("This currency pair is already in favorites.", 409);
    }

    return jsonError("A database error occurred.", 500);
  }

  return jsonError(fallback, 500);
}

function isDatabaseError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError ||
    error instanceof Prisma.PrismaClientUnknownRequestError ||
    error instanceof Prisma.PrismaClientInitializationError ||
    error instanceof Prisma.PrismaClientRustPanicError ||
    error instanceof Prisma.PrismaClientValidationError
  );
}
