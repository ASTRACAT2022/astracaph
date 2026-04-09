import { jsonResponse, okOptions } from "@/lib/http";
import { getDebugLogs } from "@/lib/store";

export const runtime = "edge";
export const preferredRegion = "global";

export async function OPTIONS(request: Request): Promise<Response> {
  return okOptions(request.headers.get("origin"));
}

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const siteKey = url.searchParams.get("siteKey") ?? undefined;
  const limitValue = Number(url.searchParams.get("limit") ?? "40");
  const logs = await getDebugLogs({
    siteKey,
    limit: Number.isFinite(limitValue) ? limitValue : 40,
  });

  return jsonResponse({
    success: true,
    logs,
  });
}
