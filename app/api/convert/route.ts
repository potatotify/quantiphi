import { NextResponse } from "next/server";

import { ExchangeRateError } from "@/lib/exchange-rate";
import { convertCurrency, parseConvertRequest, ValidationError } from "@/lib/services/convert";
import type { ApiErrorResponse, ConvertResponse } from "@/lib/types/currency";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return errorResponse("Request body must be valid JSON.", 400);
  }

  try {
    const payload = parseConvertRequest(body);
    const conversion = await convertCurrency(payload);
    return NextResponse.json<ConvertResponse>(conversion, { status: 200 });
  } catch (error) {
    return handleConvertError(error);
  }
}

function handleConvertError(error: unknown) {
  if (error instanceof ValidationError) {
    return errorResponse(error.message, 400);
  }

  if (error instanceof ExchangeRateError) {
    if (error.code === "UNSUPPORTED_CURRENCY") {
      return errorResponse(error.message, 400);
    }

    return errorResponse(error.message, 502);
  }

  return errorResponse("Unable to complete the conversion.", 500);
}

function errorResponse(error: string, status: number) {
  return NextResponse.json<ApiErrorResponse>({ error }, { status });
}
