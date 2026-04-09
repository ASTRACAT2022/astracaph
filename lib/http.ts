export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "0.0.0.0";
  }

  return request.headers.get("x-real-ip") ?? "0.0.0.0";
}

export function jsonResponse(
  body: unknown,
  init?: ResponseInit,
  extraHeaders?: HeadersInit,
): Response {
  const headers = new Headers(init?.headers);
  headers.set("content-type", "application/json; charset=utf-8");

  if (extraHeaders) {
    new Headers(extraHeaders).forEach((value, key) => headers.set(key, value));
  }

  return new Response(JSON.stringify(body), {
    ...init,
    headers,
  });
}

export function corsHeaders(origin: string | null, allowOrigin = "*"): HeadersInit {
  return {
    "access-control-allow-origin": allowOrigin === "*" ? "*" : origin ?? allowOrigin,
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "Content-Type, Authorization",
    "access-control-max-age": "86400",
    vary: "Origin",
  };
}

export function okOptions(origin: string | null, allowOrigin = "*"): Response {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(origin, allowOrigin),
  });
}
