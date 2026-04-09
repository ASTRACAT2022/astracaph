import { getRegisteredSiteByKey, getRegisteredSiteBySecret, listRegisteredSites } from "@/lib/store";
import { SiteConfig } from "@/lib/types";

export const OPEN_SITE_KEY = "pk_open_astracaph_public";
export const OPEN_SITE_NAME = "AstraCaph Open";

const fallbackSites: SiteConfig[] = [
  {
    name: OPEN_SITE_NAME,
    siteKey: OPEN_SITE_KEY,
    secret: process.env.ASTRACAPH_OPEN_SECRET ?? process.env.ASTRACAPH_TOKEN_SECRET ?? "dev-open-secret-change-me",
    origins: ["*"],
    createdAt: 0,
  },
  {
    name: "AstraCaph API Demo",
    siteKey: "pk_demo_astracat_captcha_public",
    secret: "sk_demo_astracat_captcha_secret",
    origins: ["*"],
    createdAt: 0,
  },
];

function normalizeSiteName(value: string | undefined, fallback: string): string {
  const cleaned = value?.trim();
  if (!cleaned) {
    return fallback;
  }

  return cleaned.slice(0, 80);
}

export function normalizeOrigin(rawValue: string): string | null {
  const trimmed = rawValue.trim().toLowerCase();
  if (!trimmed) {
    return null;
  }

  if (trimmed === "*") {
    return "*";
  }

  const withoutPath = trimmed.replace(/\/+$/, "");
  const hasProtocol = /^https?:\/\//.test(withoutPath);
  const hostnameCandidate = hasProtocol
    ? withoutPath.replace(/^https?:\/\//, "")
    : withoutPath;
  const protocol = /^(localhost|127(?:\.\d{1,3}){3}|0\.0\.0\.0)(:\d+)?$/i.test(hostnameCandidate)
    ? "http://"
    : "https://";

  try {
    const url = new URL(hasProtocol ? withoutPath : `${protocol}${hostnameCandidate}`);
    if (!["http:", "https:"].includes(url.protocol)) {
      return null;
    }
    if (!url.hostname) {
      return null;
    }

    return url.origin.toLowerCase();
  } catch {
    return null;
  }
}

function normalizeOrigins(origins: string[]): string[] {
  const normalized = origins
    .map((origin) => normalizeOrigin(origin))
    .filter((origin): origin is string => Boolean(origin));

  return Array.from(new Set(normalized));
}

function parseSiteConfig(): SiteConfig[] {
  const raw = process.env.ASTRACAPH_SITE_CONFIG;
  if (!raw) {
    return fallbackSites;
  }

  try {
    const parsed = JSON.parse(raw) as SiteConfig[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return fallbackSites;
    }

    return parsed
      .filter(
        (site) =>
          Boolean(site?.siteKey) &&
          Boolean(site?.secret) &&
          Array.isArray(site?.origins),
      )
      .map((site) => {
        const origins = normalizeOrigins(site.origins);
        const primaryOrigin = origins[0] ?? "*";

        return {
          name: normalizeSiteName(site.name, primaryOrigin === "*" ? "Seeded Site" : new URL(primaryOrigin).hostname),
          siteKey: site.siteKey,
          secret: site.secret,
          origins: origins.length > 0 ? origins : ["*"],
          createdAt: site.createdAt ?? 0,
        };
      });
  } catch {
    return fallbackSites;
  }
}

export async function getSiteConfigs(): Promise<SiteConfig[]> {
  const seeded = parseSiteConfig();
  const registered = await listRegisteredSites();
  const merged = new Map<string, SiteConfig>();

  for (const site of seeded) {
    merged.set(site.siteKey, site);
  }

  for (const site of registered) {
    merged.set(site.siteKey, site);
  }

  return Array.from(merged.values()).sort((left, right) => right.createdAt - left.createdAt);
}

export async function getSiteBySiteKey(siteKey: string): Promise<SiteConfig | undefined> {
  const registered = await getRegisteredSiteByKey(siteKey);
  if (registered) {
    return registered;
  }

  return parseSiteConfig().find((site) => site.siteKey === siteKey);
}

export async function getSiteBySecret(secret: string): Promise<SiteConfig | undefined> {
  const registered = await getRegisteredSiteBySecret(secret);
  if (registered) {
    return registered;
  }

  return parseSiteConfig().find((site) => site.secret === secret);
}

export function getTokenSecret(): string {
  return process.env.ASTRACAPH_TOKEN_SECRET ?? "dev-token-secret-change-me";
}

export function getOpenSiteConfig(): SiteConfig {
  return {
    name: OPEN_SITE_NAME,
    siteKey: OPEN_SITE_KEY,
    secret: process.env.ASTRACAPH_OPEN_SECRET ?? process.env.ASTRACAPH_TOKEN_SECRET ?? "dev-open-secret-change-me",
    origins: ["*"],
    createdAt: 0,
  };
}

export async function resolveChallengeSite(siteKey?: string | null): Promise<SiteConfig> {
  const trimmedSiteKey = siteKey?.trim();
  if (trimmedSiteKey) {
    const resolvedSite = await getSiteBySiteKey(trimmedSiteKey);
    if (resolvedSite) {
      return resolvedSite;
    }
  }

  return getOpenSiteConfig();
}

export function getVerifyTrustedIps(): string[] {
  return (process.env.VERIFY_TRUSTED_IPS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

export function isOriginAllowed(origin: string | null, site: SiteConfig): boolean {
  if (site.origins.includes("*")) {
    return true;
  }

  if (!origin) {
    return false;
  }

  const normalizedOrigin = normalizeOrigin(origin);
  if (!normalizedOrigin) {
    return false;
  }

  return site.origins.includes(normalizedOrigin);
}
