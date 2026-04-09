import { IpIntelReport, IpIntelSource } from "@/lib/types";

const HOSTING_PATTERN =
  /(hosting|datacenter|data center|cloud|server|colo|colocation|vps|virtual|amazon|aws|google|gcp|azure|digitalocean|linode|ovh|hetzner|leaseweb|vultr|contabo|scaleway|cloudflare|akamai|fastly)/i;

const ISP_PATTERN =
  /(isp|telecom|broadband|fiber|fibre|cable|wireless|communications|internet|telefonica|comcast|verizon|spectrum|vodafone|orange|telia|beeline|mts|rostelecom|att)/i;

function isPrivateIp(ip: string): boolean {
  return (
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip === "0.0.0.0" ||
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)
  );
}

function withTimeout(resource: string, timeoutMs: number): AbortSignal {
  if ("timeout" in AbortSignal) {
    return AbortSignal.timeout(timeoutMs);
  }

  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeoutMs);
  return controller.signal;
}

async function fetchJson<T>(url: string, timeoutMs = 1200): Promise<T | null> {
  try {
    const response = await fetch(url, {
      headers: {
        accept: "application/json",
      },
      signal: withTimeout(url, timeoutMs),
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function normalizeSource(source: Partial<IpIntelSource> & { source: string }): IpIntelSource {
  return {
    source: source.source,
    org: source.org,
    asn: source.asn,
    type: source.type,
    hosting: Boolean(source.hosting),
    proxy: Boolean(source.proxy),
    vpn: Boolean(source.vpn),
    tor: Boolean(source.tor),
    mobile: Boolean(source.mobile),
    datacenter: Boolean(source.datacenter),
  };
}

async function lookupIpapiIs(ip: string): Promise<IpIntelSource | null> {
  const data = await fetchJson<{
    company?: { name?: string; type?: string };
    asn?: { asn?: string | number; org?: string; type?: string };
    is_datacenter?: boolean;
    is_proxy?: boolean;
    is_vpn?: boolean;
    is_tor?: boolean;
    is_mobile?: boolean;
  }>(`https://api.ipapi.is/?q=${encodeURIComponent(ip)}`);

  if (!data) {
    return null;
  }

  const type = data.company?.type ?? data.asn?.type;
  return normalizeSource({
    source: "ipapi.is",
    org: data.company?.name ?? data.asn?.org,
    asn: data.asn?.asn ? String(data.asn.asn) : undefined,
    type,
    hosting: Boolean(data.is_datacenter) || /hosting|datacenter|business/i.test(type ?? ""),
    proxy: Boolean(data.is_proxy),
    vpn: Boolean(data.is_vpn),
    tor: Boolean(data.is_tor),
    mobile: Boolean(data.is_mobile),
    datacenter: Boolean(data.is_datacenter),
  });
}

async function lookupIpapiCo(ip: string): Promise<IpIntelSource | null> {
  const data = await fetchJson<{
    org?: string;
    asn?: string;
  }>(`https://ipapi.co/${encodeURIComponent(ip)}/json/`);

  if (!data) {
    return null;
  }

  const org = data.org ?? "";
  return normalizeSource({
    source: "ipapi.co",
    org,
    asn: data.asn,
    type: HOSTING_PATTERN.test(org) ? "hosting" : ISP_PATTERN.test(org) ? "isp" : undefined,
    hosting: HOSTING_PATTERN.test(org),
    proxy: false,
    vpn: false,
    tor: false,
    mobile: /mobile|wireless|cellular/i.test(org),
    datacenter: HOSTING_PATTERN.test(org),
  });
}

async function lookupIpwhoIs(ip: string): Promise<IpIntelSource | null> {
  const data = await fetchJson<{
    connection?: {
      asn?: number | string;
      org?: string;
      isp?: string;
      domain?: string;
    };
    security?: {
      proxy?: boolean;
      vpn?: boolean;
      tor?: boolean;
    };
  }>(`https://ipwho.is/${encodeURIComponent(ip)}`);

  if (!data) {
    return null;
  }

  const org = data.connection?.org ?? data.connection?.isp ?? data.connection?.domain ?? "";
  return normalizeSource({
    source: "ipwho.is",
    org,
    asn: data.connection?.asn ? String(data.connection.asn) : undefined,
    type: HOSTING_PATTERN.test(org) ? "hosting" : ISP_PATTERN.test(org) ? "isp" : undefined,
    hosting: HOSTING_PATTERN.test(org),
    proxy: Boolean(data.security?.proxy),
    vpn: Boolean(data.security?.vpn),
    tor: Boolean(data.security?.tor),
    mobile: /mobile|wireless|cellular/i.test(org),
    datacenter: HOSTING_PATTERN.test(org),
  });
}

export async function getIpIntel(ip: string): Promise<IpIntelReport> {
  if (isPrivateIp(ip)) {
    return {
      classification: "local",
      staticLikelihood: "unknown",
      risk: 0,
      reasons: ["local or private ip"],
      sources: [],
      flags: {
        hosting: false,
        proxy: false,
        vpn: false,
        tor: false,
        mobile: false,
        datacenter: false,
      },
    };
  }

  const results = await Promise.allSettled([
    lookupIpapiIs(ip),
    lookupIpapiCo(ip),
    lookupIpwhoIs(ip),
  ]);

  const sources = results
    .filter((result): result is PromiseFulfilledResult<IpIntelSource | null> => result.status === "fulfilled")
    .map((result) => result.value)
    .filter((value): value is IpIntelSource => Boolean(value));

  const flags = {
    hosting: sources.some((source) => source.hosting),
    proxy: sources.some((source) => source.proxy),
    vpn: sources.some((source) => source.vpn),
    tor: sources.some((source) => source.tor),
    mobile: sources.some((source) => source.mobile),
    datacenter: sources.some((source) => source.datacenter),
  };

  const reasons: string[] = [];
  let classification: IpIntelReport["classification"] = "unknown";
  let staticLikelihood: IpIntelReport["staticLikelihood"] = "unknown";
  let risk = 0;

  if (flags.tor) {
    risk += 0.34;
    reasons.push("ip reported as tor by ip reputation sources");
  }

  if (flags.vpn) {
    risk += 0.18;
    reasons.push("ip reported as vpn");
  }

  if (flags.proxy) {
    risk += 0.16;
    reasons.push("ip reported as proxy");
  }

  if (flags.hosting || flags.datacenter) {
    classification = "hosting";
    staticLikelihood = "unlikely_home";
    risk += 0.24;
    reasons.push("ip looks like hosting or datacenter infrastructure");
  } else if (flags.mobile) {
    classification = "mobile";
    staticLikelihood = "unknown";
    risk += 0.03;
    reasons.push("ip looks like a mobile carrier network");
  } else {
    const residentialVotes = sources.filter(
      (source) => source.type === "isp" || ISP_PATTERN.test(source.org ?? ""),
    ).length;

    if (residentialVotes >= 1) {
      classification = "residential";
      staticLikelihood = "likely_home_or_small_office";
      risk -= 0.04;
      reasons.push("ip looks like an isp or residential network");
    }
  }

  if (sources.length === 0) {
    reasons.push("ip intelligence sources unavailable");
  }

  return {
    classification,
    staticLikelihood,
    risk: Number(Math.max(0, Math.min(1, risk)).toFixed(2)),
    reasons,
    sources,
    flags,
  };
}
