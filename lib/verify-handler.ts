import { getSiteBySecret, getTokenSecret, getVerifyTrustedIps } from "@/lib/config";
import { logDebugEvent } from "@/lib/debug-log";
import { getClientIp, jsonResponse, okOptions } from "@/lib/http";
import { consumeIssuedToken, incrementSiteStat, rateLimit } from "@/lib/store";
import { verifyToken } from "@/lib/token";

type VerifyRequest = {
  secret?: string;
  secretKey?: string;
  token?: string;
};

export function handleVerifyOptions(request: Request): Response {
  return okOptions(request.headers.get("origin"));
}

export async function handleVerifyPost(
  request: Request,
  routePath: string,
): Promise<Response> {
  const ip = getClientIp(request);
  const trustedIps = getVerifyTrustedIps();

  if (trustedIps.length > 0 && !trustedIps.includes(ip)) {
    const responseBody = {
      success: false,
      error: "IP not allowed",
      message: "IP not allowed",
    };
    await logDebugEvent({
      route: routePath,
      method: "POST",
      ip,
      status: 403,
      summary: "verify blocked by ip allowlist",
      response: responseBody,
    });
    return jsonResponse(responseBody, { status: 403 });
  }

  const rate = await rateLimit(`rl:verify:${ip}`, 120, 300);
  if (!rate.allowed) {
    const responseBody = {
      success: false,
      error: "Too many verify attempts",
      message: "Too many verify attempts",
      resetAt: rate.resetAt,
    };
    await logDebugEvent({
      route: routePath,
      method: "POST",
      ip,
      status: 429,
      summary: "verify rate limited",
      response: responseBody,
    });
    return jsonResponse(responseBody, { status: 429 });
  }

  let body: VerifyRequest;
  try {
    body = (await request.json()) as VerifyRequest;
  } catch {
    const responseBody = {
      success: false,
      error: "Invalid JSON body",
      message: "Invalid JSON body",
    };
    await logDebugEvent({
      route: routePath,
      method: "POST",
      ip,
      status: 400,
      summary: "verify invalid json",
      response: responseBody,
    });
    return jsonResponse(responseBody, { status: 400 });
  }

  const providedSecret = body.secretKey?.trim() || body.secret?.trim();
  const token = body.token?.trim();

  if (!providedSecret || !token) {
    const responseBody = {
      success: false,
      error: "Both secretKey and token are required",
      message: "Both secretKey and token are required",
    };
    await logDebugEvent({
      route: routePath,
      method: "POST",
      ip,
      status: 400,
      summary: "verify missing inputs",
      response: responseBody,
    });
    return jsonResponse(responseBody, { status: 400 });
  }

  const site = await getSiteBySecret(providedSecret);
  if (!site) {
    const responseBody = {
      success: false,
      error: "Unknown secret key",
      message: "Unknown secret key",
    };
    await logDebugEvent({
      route: routePath,
      method: "POST",
      ip,
      status: 401,
      summary: "verify unknown secret",
      response: responseBody,
    });
    return jsonResponse(responseBody, { status: 401 });
  }

  const payload = await verifyToken(token, getTokenSecret());
  if (!payload) {
    const responseBody = {
      success: false,
      error: "Invalid or expired token",
      message: "CAPTCHA verification failed.",
    };
    await logDebugEvent({
      route: routePath,
      method: "POST",
      ip,
      siteKey: site.siteKey,
      status: 401,
      summary: "verify token invalid",
      response: responseBody,
    });
    return jsonResponse(responseBody, { status: 401 });
  }

  if (payload.siteKey !== site.siteKey) {
    const responseBody = {
      success: false,
      error: "Token site mismatch",
      message: "CAPTCHA verification failed.",
    };
    await logDebugEvent({
      route: routePath,
      method: "POST",
      ip,
      siteKey: site.siteKey,
      status: 403,
      summary: "verify token site mismatch",
      response: responseBody,
    });
    return jsonResponse(responseBody, { status: 403 });
  }

  const issuedRecord = await consumeIssuedToken(payload.jti);
  if (!issuedRecord) {
    const responseBody = {
      success: false,
      error: "Token already used or unknown",
      message: "CAPTCHA verification failed.",
    };
    await logDebugEvent({
      route: routePath,
      method: "POST",
      ip,
      siteKey: site.siteKey,
      status: 409,
      summary: "verify token already consumed",
      response: responseBody,
    });
    return jsonResponse(responseBody, { status: 409 });
  }

  await incrementSiteStat(site.siteKey, "verified");

  const responseBody = {
    success: true,
    message: "Verification successful",
    siteKey: site.siteKey,
    challengeId: payload.challengeId,
    score: payload.score,
    mode: payload.mode,
    fingerprintHash: payload.fingerprintHash,
    issuedAt: payload.iat,
    expiresAt: payload.exp,
  };

  await logDebugEvent({
    route: routePath,
    method: "POST",
    ip,
    siteKey: site.siteKey,
    status: 200,
    summary: "verify success",
    response: {
      siteKey: responseBody.siteKey,
      score: responseBody.score,
      mode: responseBody.mode,
    },
  });

  return jsonResponse(responseBody);
}
