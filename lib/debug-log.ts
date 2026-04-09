import { appendDebugLog } from "@/lib/store";

function sanitize(value: unknown): Record<string, unknown> | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  try {
    return JSON.parse(JSON.stringify(value)) as Record<string, unknown>;
  } catch {
    return undefined;
  }
}

export async function logDebugEvent(input: {
  route: string;
  method: string;
  siteKey?: string;
  ip?: string;
  status: number;
  summary: string;
  request?: unknown;
  response?: unknown;
}): Promise<void> {
  await appendDebugLog({
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    route: input.route,
    method: input.method,
    siteKey: input.siteKey,
    ip: input.ip,
    status: input.status,
    summary: input.summary,
    request: sanitize(input.request),
    response: sanitize(input.response),
  });
}
