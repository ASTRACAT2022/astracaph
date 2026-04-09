import { Redis } from "@upstash/redis";
import {
  ChallengeRecord,
  DebugLogEntry,
  IssuedTokenRecord,
  SiteConfig,
  SiteStats,
} from "@/lib/types";

type MemoryState = {
  counters: Map<string, { count: number; resetAt: number }>;
  challenges: Map<string, ChallengeRecord>;
  tokens: Map<string, IssuedTokenRecord>;
  stats: Map<string, SiteStats>;
  sitesByKey: Map<string, SiteConfig>;
  sitesBySecret: Map<string, string>;
  debugLogs: DebugLogEntry[];
};

function getMemoryState(): MemoryState {
  const scope = globalThis as typeof globalThis & {
    __astracaphMemory?: MemoryState;
  };

  if (!scope.__astracaphMemory) {
    scope.__astracaphMemory = {
      counters: new Map(),
      challenges: new Map(),
      tokens: new Map(),
      stats: new Map(),
      sitesByKey: new Map(),
      sitesBySecret: new Map(),
      debugLogs: [],
    };
  }

  return scope.__astracaphMemory;
}

function getRedisClient(): Redis | null {
  if (
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    return Redis.fromEnv();
  }

  return null;
}

function getEmptyStats(): SiteStats {
  return {
    total: 0,
    passed: 0,
    challenged: 0,
    failed: 0,
    verified: 0,
  };
}

export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const redis = getRedisClient();
  if (redis) {
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, windowSeconds);
    }
    const ttl = await redis.ttl(key);
    return {
      allowed: count <= limit,
      remaining: Math.max(limit - count, 0),
      resetAt: Date.now() + Math.max(ttl, 0) * 1000,
    };
  }

  const memory = getMemoryState();
  const now = Date.now();
  const item = memory.counters.get(key);

  if (!item || item.resetAt <= now) {
    memory.counters.set(key, {
      count: 1,
      resetAt: now + windowSeconds * 1000,
    });

    return {
      allowed: true,
      remaining: limit - 1,
      resetAt: now + windowSeconds * 1000,
    };
  }

  item.count += 1;
  memory.counters.set(key, item);
  return {
    allowed: item.count <= limit,
    remaining: Math.max(limit - item.count, 0),
    resetAt: item.resetAt,
  };
}

export async function saveChallenge(record: ChallengeRecord): Promise<void> {
  const redis = getRedisClient();
  if (redis) {
    await redis.set(`challenge:${record.id}`, record, { ex: 600 });
    return;
  }

  getMemoryState().challenges.set(record.id, record);
}

export async function getChallenge(id: string): Promise<ChallengeRecord | null> {
  const redis = getRedisClient();
  if (redis) {
    return (await redis.get<ChallengeRecord>(`challenge:${id}`)) ?? null;
  }

  return getMemoryState().challenges.get(id) ?? null;
}

export async function saveIssuedToken(record: IssuedTokenRecord): Promise<void> {
  const redis = getRedisClient();
  if (redis) {
    const ttlSeconds = Math.max(Math.ceil((record.expiresAt - Date.now()) / 1000), 60);
    await redis.set(`token:${record.jti}`, record, { ex: ttlSeconds });
    return;
  }

  getMemoryState().tokens.set(record.jti, record);
}

export async function consumeIssuedToken(jti: string): Promise<IssuedTokenRecord | null> {
  const redis = getRedisClient();
  if (redis) {
    const record = await redis.get<IssuedTokenRecord>(`token:${jti}`);
    if (!record || record.used) {
      return null;
    }

    await redis.set(`token:${jti}`, { ...record, used: true }, { ex: 600 });
    return record;
  }

  const memory = getMemoryState();
  const record = memory.tokens.get(jti);
  if (!record || record.used) {
    return null;
  }

  memory.tokens.set(jti, { ...record, used: true });
  return record;
}

export async function incrementSiteStat(
  siteKey: string,
  field: keyof SiteStats,
): Promise<void> {
  const redis = getRedisClient();
  if (redis) {
    await redis.hincrby(`stats:${siteKey}`, field, 1);
    return;
  }

  const memory = getMemoryState();
  const current = memory.stats.get(siteKey) ?? getEmptyStats();
  current[field] += 1;
  memory.stats.set(siteKey, current);
}

export async function getSiteStats(siteKey: string): Promise<SiteStats> {
  const redis = getRedisClient();
  if (redis) {
    const stats = await redis.hgetall<Record<string, number>>(`stats:${siteKey}`);
    return {
      total: Number(stats?.total ?? 0),
      passed: Number(stats?.passed ?? 0),
      challenged: Number(stats?.challenged ?? 0),
      failed: Number(stats?.failed ?? 0),
      verified: Number(stats?.verified ?? 0),
    };
  }

  return getMemoryState().stats.get(siteKey) ?? getEmptyStats();
}

export async function saveSiteConfig(site: SiteConfig): Promise<void> {
  const redis = getRedisClient();
  if (redis) {
    await redis.set(`site:${site.siteKey}`, site);
    await redis.set(`site-secret:${site.secret}`, site.siteKey);
    await redis.sadd("sites:index", site.siteKey);
    return;
  }

  const memory = getMemoryState();
  memory.sitesByKey.set(site.siteKey, site);
  memory.sitesBySecret.set(site.secret, site.siteKey);
}

export async function deleteRegisteredSiteBySecret(secret: string): Promise<SiteConfig | null> {
  const redis = getRedisClient();
  if (redis) {
    const siteKey = await redis.get<string>(`site-secret:${secret}`);
    if (!siteKey) {
      return null;
    }

    const site = await redis.get<SiteConfig>(`site:${siteKey}`);
    if (!site) {
      await redis.del(`site-secret:${secret}`);
      await redis.srem("sites:index", siteKey);
      return null;
    }

    await redis.del(`site:${siteKey}`);
    await redis.del(`site-secret:${secret}`);
    await redis.srem("sites:index", siteKey);
    await redis.del(`stats:${siteKey}`);
    return site;
  }

  const memory = getMemoryState();
  const siteKey = memory.sitesBySecret.get(secret);
  if (!siteKey) {
    return null;
  }

  const site = memory.sitesByKey.get(siteKey) ?? null;
  memory.sitesBySecret.delete(secret);
  memory.sitesByKey.delete(siteKey);
  memory.stats.delete(siteKey);
  return site;
}

export async function getRegisteredSiteByKey(siteKey: string): Promise<SiteConfig | null> {
  const redis = getRedisClient();
  if (redis) {
    return (await redis.get<SiteConfig>(`site:${siteKey}`)) ?? null;
  }

  return getMemoryState().sitesByKey.get(siteKey) ?? null;
}

export async function getRegisteredSiteBySecret(secret: string): Promise<SiteConfig | null> {
  const redis = getRedisClient();
  if (redis) {
    const siteKey = await redis.get<string>(`site-secret:${secret}`);
    if (!siteKey) {
      return null;
    }

    return (await redis.get<SiteConfig>(`site:${siteKey}`)) ?? null;
  }

  const memory = getMemoryState();
  const siteKey = memory.sitesBySecret.get(secret);
  if (!siteKey) {
    return null;
  }

  return memory.sitesByKey.get(siteKey) ?? null;
}

export async function listRegisteredSites(): Promise<SiteConfig[]> {
  const redis = getRedisClient();
  if (redis) {
    const siteKeys = (await redis.smembers("sites:index")) as string[] | null;
    const sites: SiteConfig[] = [];

    for (const siteKey of siteKeys ?? []) {
      const site = await redis.get<SiteConfig>(`site:${siteKey}`);
      if (site) {
        sites.push(site);
      }
    }

    return sites.sort((left, right) => right.createdAt - left.createdAt);
  }

  return Array.from(getMemoryState().sitesByKey.values()).sort(
    (left, right) => right.createdAt - left.createdAt,
  );
}

export async function appendDebugLog(entry: DebugLogEntry): Promise<void> {
  const redis = getRedisClient();
  if (redis) {
    await redis.lpush("debug:logs", entry);
    await redis.ltrim("debug:logs", 0, 199);
    return;
  }

  const memory = getMemoryState();
  memory.debugLogs.unshift(entry);
  if (memory.debugLogs.length > 200) {
    memory.debugLogs.length = 200;
  }
}

export async function getDebugLogs(options?: {
  siteKey?: string;
  limit?: number;
}): Promise<DebugLogEntry[]> {
  const limit = Math.max(1, Math.min(options?.limit ?? 40, 100));
  const redis = getRedisClient();
  if (redis) {
    const logs = (await redis.lrange<DebugLogEntry>("debug:logs", 0, 199)) ?? [];
    return logs
      .filter((entry) => !options?.siteKey || entry.siteKey === options.siteKey)
      .slice(0, limit);
  }

  return getMemoryState().debugLogs
    .filter((entry) => !options?.siteKey || entry.siteKey === options.siteKey)
    .slice(0, limit);
}
