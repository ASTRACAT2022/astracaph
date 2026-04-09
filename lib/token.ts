type TokenHeader = {
  alg: "HS256";
  typ: "JWT";
};

export type TokenPayload = {
  iss: "astracaph";
  aud: "astracaph-verify";
  siteKey: string;
  challengeId: string;
  jti: string;
  score: number;
  mode: "passive" | "visual";
  fingerprintHash: string;
  iat: number;
  exp: number;
};

function encodeBase64Url(value: string): string {
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return atob(`${normalized}${padding}`);
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function signValue(value: string, secret: string): Promise<string> {
  const key = await importHmacKey(secret);
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(value),
  );
  const binary = Array.from(new Uint8Array(signature))
    .map((byte) => String.fromCharCode(byte))
    .join("");
  return encodeBase64Url(binary);
}

export async function signToken(payload: TokenPayload, secret: string): Promise<string> {
  const header: TokenHeader = {
    alg: "HS256",
    typ: "JWT",
  };

  const encodedHeader = encodeBase64Url(JSON.stringify(header));
  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const signature = await signValue(`${encodedHeader}.${encodedPayload}`, secret);
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export async function verifyToken(
  token: string,
  secret: string,
): Promise<TokenPayload | null> {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }

  const [headerPart, payloadPart, signature] = parts;
  const expectedSignature = await signValue(`${headerPart}.${payloadPart}`, secret);
  if (expectedSignature !== signature) {
    return null;
  }

  try {
    const header = JSON.parse(decodeBase64Url(headerPart)) as TokenHeader;
    if (header.alg !== "HS256" || header.typ !== "JWT") {
      return null;
    }

    const payload = JSON.parse(decodeBase64Url(payloadPart)) as TokenPayload;
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp <= now || payload.iat > now + 10) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
