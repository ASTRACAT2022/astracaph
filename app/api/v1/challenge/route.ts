import { getTokenSecret, isOriginAllowed, normalizeOrigin, resolveChallengeSite } from "@/lib/config";
import { logDebugEvent } from "@/lib/debug-log";
import { sha256 } from "@/lib/hash";
import { corsHeaders, getClientIp, jsonResponse, okOptions } from "@/lib/http";
import { getIpIntel } from "@/lib/ip-intel";
import { fingerprintSummary, scoreTelemetry } from "@/lib/scoring";
import { saveChallenge, saveIssuedToken, incrementSiteStat, rateLimit, getChallenge } from "@/lib/store";
import { signToken } from "@/lib/token";
import { ChallengeRequest } from "@/lib/types";

export const runtime = "edge";
export const preferredRegion = "global";

function createId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "")}`;
}

function isChallengeRequest(body: unknown): body is ChallengeRequest {
  if (!body || typeof body !== "object") {
    return false;
  }

  const candidate = body as Partial<ChallengeRequest>;
  return (
    (typeof candidate.siteKey === "undefined" || typeof candidate.siteKey === "string") &&
    !!candidate.fingerprint &&
    Array.isArray(candidate.motion) &&
    !!candidate.behavior
  );
}

function resolveBoundOrigin(origin: string | null, referrer: string | undefined): string | null {
  const normalizedOrigin = normalizeOrigin(origin ?? "");
  if (normalizedOrigin) {
    return normalizedOrigin;
  }

  if (!referrer) {
    return null;
  }

  try {
    return normalizeOrigin(new URL(referrer).origin);
  } catch {
    return null;
  }
}

export async function OPTIONS(request: Request): Promise<Response> {
  return okOptions(request.headers.get("origin"));
}

export async function POST(request: Request): Promise<Response> {
  const origin = request.headers.get("origin");
  const ip = getClientIp(request);
  const rate = await rateLimit(`rl:challenge:${ip}`, 45, 300);
  const baseHeaders = corsHeaders(origin);

  if (!rate.allowed) {
    const responseBody = { error: "Too many challenge attempts", resetAt: rate.resetAt };
    await logDebugEvent({
      route: "/api/v1/challenge",
      method: "POST",
      ip,
      status: 429,
      summary: "challenge rate limited",
      response: responseBody,
    });
    return jsonResponse(
      responseBody,
      { status: 429 },
      baseHeaders,
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    const responseBody = { error: "Invalid JSON body" };
    await logDebugEvent({
      route: "/api/v1/challenge",
      method: "POST",
      ip,
      status: 400,
      summary: "challenge invalid json",
      response: responseBody,
    });
    return jsonResponse(responseBody, { status: 400 }, baseHeaders);
  }

  if (!isChallengeRequest(body)) {
    const responseBody = { error: "Invalid challenge payload" };
    await logDebugEvent({
      route: "/api/v1/challenge",
      method: "POST",
      ip,
      status: 400,
      summary: "challenge invalid payload",
      response: responseBody,
    });
    return jsonResponse(responseBody, { status: 400 }, baseHeaders);
  }

  const site = await resolveChallengeSite(body.siteKey);

  if (!isOriginAllowed(origin, site)) {
    const responseBody = { error: "Origin is not allowed for this site key" };
    await logDebugEvent({
      route: "/api/v1/challenge",
      method: "POST",
      ip,
      siteKey: site.siteKey,
      status: 403,
      summary: "challenge blocked by origin policy",
      request: { origin, page: body.page },
      response: responseBody,
    });
    return jsonResponse(responseBody, { status: 403 }, baseHeaders);
  }

  await incrementSiteStat(site.siteKey, "total");

  const ipIntel = await getIpIntel(ip);
  const score = scoreTelemetry(body, ipIntel);
  const fingerprintHash = await sha256(fingerprintSummary(body));
  const boundOrigin = resolveBoundOrigin(origin, body.referrer);
  const boundHost = boundOrigin ? new URL(boundOrigin).host : "unknown";

  if (score.decision === "deny") {
    await incrementSiteStat(site.siteKey, "failed");
    const responseBody = {
      error: "Challenge rejected",
      state: "failed",
      score: score.score,
      reasons: score.reasons,
      ipIntel: score.ipIntel,
    };
    await logDebugEvent({
      route: "/api/v1/challenge",
      method: "POST",
      ip,
      siteKey: site.siteKey,
      status: 403,
      summary: "challenge denied",
      request: {
        page: body.page,
        pointerMoves: body.behavior.pointerMoves,
        dwellMs: body.behavior.dwellMs,
      },
      response: responseBody,
    });
    return jsonResponse(
      responseBody,
      { status: 403 },
      baseHeaders,
    );
  }

  if (score.decision === "challenge" && !body.interaction?.confirmed) {
    const challengeId = createId("chl");
    await saveChallenge({
      id: challengeId,
      siteKey: site.siteKey,
      ip,
      createdAt: Date.now(),
      fingerprintHash,
      score: score.score,
      challengeType: score.challenge.type,
      requiredHoldMs: score.challenge.requiredHoldMs,
      challengeReason: score.challenge.reason,
    });
    await incrementSiteStat(site.siteKey, "challenged");
    const responseBody = {
      state: "visual_challenge",
      needsVisual: true,
      challengeId,
      challengeType: score.challenge.type,
      requiredHoldMs: score.challenge.requiredHoldMs,
      challengeReason: score.challenge.reason,
      score: score.score,
      reasons: score.reasons,
      ipIntel: score.ipIntel,
    };
    await logDebugEvent({
      route: "/api/v1/challenge",
      method: "POST",
      ip,
      siteKey: site.siteKey,
      status: 202,
      summary: "challenge escalated to visual step",
      request: {
        page: body.page,
        pointerMoves: body.behavior.pointerMoves,
        dwellMs: body.behavior.dwellMs,
      },
      response: responseBody,
    });
    return jsonResponse(
      responseBody,
      { status: 202 },
      baseHeaders,
    );
  }

  let challengeId = createId("pas");
  let mode: "passive" | "visual" = "passive";

  if (body.interaction?.confirmed) {
    const stored = body.interaction.challengeId
      ? await getChallenge(body.interaction.challengeId)
      : null;

    if (!stored || stored.siteKey !== site.siteKey || stored.ip !== ip) {
      await incrementSiteStat(site.siteKey, "failed");
      const responseBody = { error: "Visual challenge context is invalid or expired" };
      await logDebugEvent({
        route: "/api/v1/challenge",
        method: "POST",
        ip,
        siteKey: site.siteKey,
        status: 400,
        summary: "visual challenge context invalid",
        request: {
          page: body.page,
          challengeId: body.interaction?.challengeId,
        },
        response: responseBody,
      });
      return jsonResponse(
        responseBody,
        { status: 400 },
        baseHeaders,
      );
    }

    const actualHoldMs = Math.max(0, body.interaction.holdDurationMs ?? 0);
    if (stored.requiredHoldMs > 0 && actualHoldMs < stored.requiredHoldMs) {
      const responseBody = {
        state: "visual_challenge",
        needsVisual: true,
        challengeId: stored.id,
        challengeType: stored.challengeType,
        requiredHoldMs: stored.requiredHoldMs,
        challengeReason: stored.challengeReason,
        error: "Physical confirmation was too short",
      };
      await logDebugEvent({
        route: "/api/v1/challenge",
        method: "POST",
        ip,
        siteKey: site.siteKey,
        status: 202,
        summary: "visual challenge hold was too short",
        request: {
          page: body.page,
          challengeId: stored.id,
          actualHoldMs,
          requiredHoldMs: stored.requiredHoldMs,
        },
        response: responseBody,
      });
      return jsonResponse(
        responseBody,
        { status: 202 },
        baseHeaders,
      );
    }

    challengeId = stored.id;
    mode = "visual";
    await incrementSiteStat(site.siteKey, "passed");
  } else {
    await incrementSiteStat(site.siteKey, "passed");
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  const jti = createId("tok");
  const payload = {
    iss: "astracaph" as const,
    aud: "astracaph-verify" as const,
    siteKey: site.siteKey,
    boundOrigin: boundOrigin ?? "unknown",
    boundHost,
    challengeId,
    jti,
    score: score.score,
    mode,
    fingerprintHash,
    iat: nowSeconds,
    exp: nowSeconds + 180,
  };

  const token = await signToken(payload, getTokenSecret());
  await saveIssuedToken({
    jti,
    siteKey: site.siteKey,
    score: score.score,
    challengeId,
    fingerprintHash,
    issuedAt: Date.now(),
    expiresAt: Date.now() + 180000,
    used: false,
  });

  const responseBody = {
    state: "success",
    token,
    expiresIn: 180,
    score: score.score,
    confidence: Number((1 - score.score).toFixed(2)),
    reasons: score.reasons,
    ipIntel: score.ipIntel,
    mode,
  };
  await logDebugEvent({
    route: "/api/v1/challenge",
    method: "POST",
    ip,
    siteKey: site.siteKey,
    status: 200,
    summary: "challenge passed and token issued",
    request: {
      page: body.page,
      pointerMoves: body.behavior.pointerMoves,
      dwellMs: body.behavior.dwellMs,
    },
    response: {
      score: responseBody.score,
      mode: responseBody.mode,
      ipIntel: responseBody.ipIntel,
    },
  });

  return jsonResponse(
    responseBody,
    { status: 200 },
    baseHeaders,
  );
}
