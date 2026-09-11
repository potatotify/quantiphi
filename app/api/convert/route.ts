import { NextResponse } from "next/server";

import { readJsonBody, toErrorResponse } from "@/lib/http/errors";
import { convertCurrency, parseConvertRequest } from "@/lib/services/convert";
import type { ConvertResponse } from "@/lib/types/currency";

export async function POST(request: Request) {
  try {
    const payload = parseConvertRequest(await readJsonBody(request));
    const conversion = await convertCurrency(payload);
    return NextResponse.json<ConvertResponse>(conversion, { status: 200 });
  } catch (error) {
    return toErrorResponse(error, "Unable to complete the conversion.");
  }
}
