import {
  getTokenSecret,
  normalizeOrigin,
} from "@/lib/config";
import { logDebugEvent } from "@/lib/debug-log";
import { corsHeaders, getClientIp, jsonResponse, okOptions } from "@/lib/http";
import {
  deleteRegisteredSiteBySecret,
  rateLimit,
  saveSiteConfig,
} from "@/lib/store";
import { SiteConfig } from "@/lib/types";

export const runtime = "edge";
export const preferredRegion = "global";

type RegistrationRequest = {
  domain?: string;
  origin?: string;
  name?: string;
};

type DeleteRequest = {
  domain?: string;
  origin?: string;
  secret?: string;
};

function createKey(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "")}`;
}

function deriveSiteName(name: string | undefined, origin: string): string {
  const cleaned = name?.trim();
  if (cleaned) {
    return cleaned.slice(0, 80);
  }

  return new URL(origin).hostname;
}

function buildResponse(site: SiteConfig) {
  return {
    success: true,
    warning:
      "Save the sk_live secret now. It is required for backend verification and for deleting the bound domain later.",
    site: {
      name: site.name,
      siteKey: site.siteKey,
      secret: site.secret,
      origins: site.origins,
    },
    embed: `<script src="https://caph.astracat.ru/api/v1/widget.js" async defer></script>
<div id="astracaph-container" data-sitekey="${site.siteKey}"></div>`,
    verifyExample: `POST https://caph.astracat.ru/api/v1/verify
Content-Type: application/json

{
  "secret": "${site.secret}",
  "token": "user_generated_token"
}`,
  };
}

export async function OPTIONS(request: Request): Promise<Response> {
  return okOptions(request.headers.get("origin"));
}

export async function GET(request: Request): Promise<Response> {
  return jsonResponse(
    {
      success: true,
      message:
        "Use POST /api/v1/sites with { domain, name? } or { origin, name? } to issue a bound key pair. Use DELETE /api/v1/sites with { origin|domain, secret } to remove a registered domain.",
      tokenSigningConfigured: Boolean(getTokenSecret()),
    },
    { status: 200 },
    corsHeaders(request.headers.get("origin")),
  );
}

export async function POST(request: Request): Promise<Response> {
  const origin = request.headers.get("origin");
  const ip = getClientIp(request);
  const rate = await rateLimit(`rl:site-register:${ip}`, 12, 3600);
  const baseHeaders = corsHeaders(origin);

  if (!rate.allowed) {
    const responseBody = { success: false, error: "Too many key registrations from this IP", resetAt: rate.resetAt };
    await logDebugEvent({
      route: "/api/v1/sites",
      method: "POST",
      ip,
      status: 429,
      summary: "site registration rate limited",
      response: responseBody,
    });
    return jsonResponse(
      responseBody,
      { status: 429 },
      baseHeaders,
    );
  }

  let body: RegistrationRequest;
  try {
    body = (await request.json()) as RegistrationRequest;
  } catch {
    const responseBody = { success: false, error: "Invalid JSON body" };
    await logDebugEvent({
      route: "/api/v1/sites",
      method: "POST",
      ip,
      status: 400,
      summary: "site registration invalid json",
      response: responseBody,
    });
    return jsonResponse(
      responseBody,
      { status: 400 },
      baseHeaders,
    );
  }

  const rawOrigin = body.origin ?? body.domain;
  if (!rawOrigin || typeof rawOrigin !== "string") {
    const responseBody = { success: false, error: "Provide domain or origin" };
    await logDebugEvent({
      route: "/api/v1/sites",
      method: "POST",
      ip,
      status: 400,
      summary: "site registration missing domain",
      request: body,
      response: responseBody,
    });
    return jsonResponse(
      responseBody,
      { status: 400 },
      baseHeaders,
    );
  }

  const normalizedOrigin = normalizeOrigin(rawOrigin);
  if (!normalizedOrigin || normalizedOrigin === "*") {
    const responseBody = { success: false, error: "Domain or origin is invalid" };
    await logDebugEvent({
      route: "/api/v1/sites",
      method: "POST",
      ip,
      status: 400,
      summary: "site registration invalid origin",
      request: body,
      response: responseBody,
    });
    return jsonResponse(
      responseBody,
      { status: 400 },
      baseHeaders,
    );
  }

  const site: SiteConfig = {
    name: deriveSiteName(typeof body.name === "string" ? body.name : undefined, normalizedOrigin),
    siteKey: createKey("pk_live"),
    secret: createKey("sk_live"),
    origins: [normalizedOrigin],
    createdAt: Date.now(),
  };

  await saveSiteConfig(site);

  const responseBody = buildResponse(site);
  await logDebugEvent({
    route: "/api/v1/sites",
    method: "POST",
    siteKey: site.siteKey,
    ip,
    status: 201,
    summary: "site registration issued keys",
    request: { domain: rawOrigin, name: body.name },
    response: {
      siteKey: site.siteKey,
      origins: site.origins,
    },
  });

  return jsonResponse(responseBody, { status: 201 }, baseHeaders);
}

export async function DELETE(request: Request): Promise<Response> {
  const origin = request.headers.get("origin");
  const ip = getClientIp(request);
  const rate = await rateLimit(`rl:site-delete:${ip}`, 16, 3600);
  const baseHeaders = corsHeaders(origin);

  if (!rate.allowed) {
    const responseBody = { success: false, error: "Too many delete attempts from this IP", resetAt: rate.resetAt };
    await logDebugEvent({
      route: "/api/v1/sites",
      method: "DELETE",
      ip,
      status: 429,
      summary: "site delete rate limited",
      response: responseBody,
    });
    return jsonResponse(
      responseBody,
      { status: 429 },
      baseHeaders,
    );
  }

  let body: DeleteRequest;
  try {
    body = (await request.json()) as DeleteRequest;
  } catch {
    const responseBody = { success: false, error: "Invalid JSON body" };
    await logDebugEvent({
      route: "/api/v1/sites",
      method: "DELETE",
      ip,
      status: 400,
      summary: "site delete invalid json",
      response: responseBody,
    });
    return jsonResponse(
      responseBody,
      { status: 400 },
      baseHeaders,
    );
  }

  if (!body.secret || typeof body.secret !== "string") {
    const responseBody = { success: false, error: "Provide the sk_live secret to confirm deletion" };
    await logDebugEvent({
      route: "/api/v1/sites",
      method: "DELETE",
      ip,
      status: 400,
      summary: "site delete missing secret",
      request: body,
      response: responseBody,
    });
    return jsonResponse(
      responseBody,
      { status: 400 },
      baseHeaders,
    );
  }

  const rawOrigin = body.origin ?? body.domain;
  if (!rawOrigin || typeof rawOrigin !== "string") {
    const responseBody = { success: false, error: "Provide the bound domain or origin you want to remove" };
    await logDebugEvent({
      route: "/api/v1/sites",
      method: "DELETE",
      ip,
      status: 400,
      summary: "site delete missing origin",
      request: body,
      response: responseBody,
    });
    return jsonResponse(
      responseBody,
      { status: 400 },
      baseHeaders,
    );
  }

  const normalizedOrigin = normalizeOrigin(rawOrigin);
  if (!normalizedOrigin || normalizedOrigin === "*") {
    const responseBody = { success: false, error: "Domain or origin is invalid" };
    await logDebugEvent({
      route: "/api/v1/sites",
      method: "DELETE",
      ip,
      status: 400,
      summary: "site delete invalid origin",
      request: body,
      response: responseBody,
    });
    return jsonResponse(
      responseBody,
      { status: 400 },
      baseHeaders,
    );
  }

  const site = await deleteRegisteredSiteBySecret(body.secret);
  if (!site) {
    const responseBody = { success: false, error: "No registered domain matches that sk_live secret" };
    await logDebugEvent({
      route: "/api/v1/sites",
      method: "DELETE",
      ip,
      status: 404,
      summary: "site delete secret not found",
      request: { origin: normalizedOrigin },
      response: responseBody,
    });
    return jsonResponse(
      responseBody,
      { status: 404 },
      baseHeaders,
    );
  }

  if (!site.origins.includes(normalizedOrigin)) {
    await saveSiteConfig(site);
    const responseBody = { success: false, error: "The provided origin does not match the sk_live secret" };
    await logDebugEvent({
      route: "/api/v1/sites",
      method: "DELETE",
      ip,
      siteKey: site.siteKey,
      status: 403,
      summary: "site delete origin mismatch",
      request: { origin: normalizedOrigin },
      response: responseBody,
    });
    return jsonResponse(
      responseBody,
      { status: 403 },
      baseHeaders,
    );
  }

  const responseBody = {
    success: true,
    removedOrigin: normalizedOrigin,
    siteKey: site.siteKey,
    message: "Domain removed successfully. Its siteKey and sk_live secret are no longer valid.",
  };
  await logDebugEvent({
    route: "/api/v1/sites",
    method: "DELETE",
    siteKey: site.siteKey,
    ip,
    status: 200,
    summary: "site deleted",
    request: { origin: normalizedOrigin },
    response: responseBody,
  });

  return jsonResponse(
    responseBody,
    { status: 200 },
    baseHeaders,
  );
}
