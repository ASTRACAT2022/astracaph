import crypto from "crypto"

// In-memory storage for AstraCaph - no external databases
interface ChallengeData {
  token: string
  createdAt: number
  expiresAt: number
  siteKey: string
  fingerprint?: string
  solved: boolean
  attempts: number
}

interface SiteKeyData {
  publicKey: string
  secretKey: string
  domain: string
  enabled: boolean
  createdAt: number
}

interface UserData {
  id: string
  email: string
  passwordHash: string
  siteKey: string
  createdAt: number
  sessionToken?: string,
}

interface VerificationLog {
  timestamp: number
  success: boolean
  ip?: string
  userAgent?: string
  country?: string
  bot: boolean
  score: number
  siteKey: string
}

interface Statistics {
  totalVerifications: number
  successfulVerifications: number
  failedVerifications: number
  botAttempts: number
  byDomain: Record<string, number>
  byCountry: Record<string, number>
}

class CaptchaStorage {
  private challenges: Map<string, ChallengeData> = new Map()
  private siteKeys: Map<string, SiteKeyData> = new Map()
  private users: Map<string, UserData> = new Map()
  private logs: VerificationLog[] = []
  private stats: Statistics = {
    totalVerifications: 0,
    successfulVerifications: 0,
    failedVerifications: 0,
    botAttempts: 0,
    byDomain: {},
    byCountry: {},
  }
  private ipAttempts: Map<string, { count: number; lastAttempt: number }> = new Map()

  constructor() {
    // Initialize with demo site key
    this.siteKeys.set("demo", {
      publicKey: "pk_demo_astracat_captcha_public",
      secretKey: "sk_demo_astracat_captcha_secret",
      domain: "*",
      enabled: true,
      createdAt: Date.now(),
    })

    if (process.env.SITE_KEY_SECRET) {
      this.siteKeys.set("pk_l6ANF1UylGu2Ccx7", {
        publicKey: "pk_l6ANF1UylGu2Ccx7",
        secretKey: process.env.SITE_KEY_SECRET,
        domain: "*",
        enabled: true,
        createdAt: Date.now(),
      })
    }

    // Clean up expired challenges every 5 minutes
    setInterval(() => this.cleanupExpiredChallenges(), 5 * 60 * 1000)

    // Clean up old logs every hour (keep last 10000)
    setInterval(() => this.cleanupOldLogs(), 60 * 60 * 1000)
  }

  // Challenge management
  createChallenge(token: string, siteKey: string, ttl = 300000): ChallengeData {
    const challenge: ChallengeData = {
      token,
      createdAt: Date.now(),
      expiresAt: Date.now() + ttl,
      siteKey,
      solved: false,
      attempts: 0,
    }
    this.challenges.set(token, challenge)
    return challenge
  }

  getChallenge(token: string): ChallengeData | undefined {
    const challenge = this.challenges.get(token)
    if (challenge && challenge.expiresAt < Date.now()) {
      this.challenges.delete(token)
      return undefined
    }
    return challenge
  }

  markChallengeSolved(token: string): boolean {
    const challenge = this.challenges.get(token)
    if (challenge && !challenge.solved) {
      challenge.solved = true
      challenge.attempts++
      return true
    }
    return false
  }

  incrementChallengeAttempts(token: string): number {
    const challenge = this.challenges.get(token)
    if (challenge) {
      challenge.attempts++
      return challenge.attempts
    }
    return 0
  }

  deleteChallenge(token: string): void {
    this.challenges.delete(token)
  }

  private cleanupExpiredChallenges(): void {
    const now = Date.now()
    for (const [token, challenge] of this.challenges.entries()) {
      if (challenge.expiresAt < now) {
        this.challenges.delete(token)
      }
    }
  }

  // Site key management
  createSiteKey(domain: string): { publicKey: string; secretKey: string } {
    const id = this.generateId(16)
    const publicKey = `pk_${id}`
    const secretKey = `sk_${this.generateId(32)}`

    this.siteKeys.set(publicKey, {
      publicKey,
      secretKey,
      domain,
      enabled: true,
      createdAt: Date.now(),
    })

    return { publicKey, secretKey }
  }

  getSiteKey(publicKey: string): SiteKeyData | undefined {
    return this.siteKeys.get(publicKey)
  }

  validateSiteKey(publicKey: string, secretKey: string): boolean {
    const siteKey = this.siteKeys.get(publicKey)
    return siteKey?.secretKey === secretKey && siteKey.enabled
  }

  getAllSiteKeys(): SiteKeyData[] {
    return Array.from(this.siteKeys.values())
  }

  // User management
  createUser(email: string, passwordHash: string): UserData {
    if (this.getUserByEmail(email)) {
      throw new Error("User with this email already exists")
    }
    const siteKey = this.createSiteKey(email)
    const user: UserData = {
      id: this.generateId(16),
      email,
      passwordHash,
      siteKey: siteKey.publicKey,
      createdAt: Date.now(),
    }
    this.users.set(user.id, user)
    return user
  }

  getUserByEmail(email: string): UserData | undefined {
    return Array.from(this.users.values()).find((user) => user.email === email)
  }

  getUserBySessionToken(token: string): UserData | undefined {
    return Array.from(this.users.values()).find((user) => user.sessionToken === token)
  }

  createSessionToken(userId: string): string | null {
    const user = this.users.get(userId)
    if (user) {
      const token = crypto.randomBytes(32).toString("hex")
      user.sessionToken = token
      return token
    }
    return null
  }

  // Rate limiting
  checkRateLimit(ip: string, maxAttempts = 10, windowMs = 60000): boolean {
    const now = Date.now()
    const record = this.ipAttempts.get(ip)

    if (!record) {
      this.ipAttempts.set(ip, { count: 1, lastAttempt: now })
      return true
    }

    if (now - record.lastAttempt > windowMs) {
      // Reset window
      record.count = 1
      record.lastAttempt = now
      return true
    }

    if (record.count >= maxAttempts) {
      return false
    }

    record.count++
    record.lastAttempt = now
    return true
  }

  // Logging and statistics
  addLog(log: Omit<VerificationLog, "timestamp">): void {
    this.logs.push({
      ...log,
      timestamp: Date.now(),
    })

    // Update statistics
    this.stats.totalVerifications++
    if (log.success) {
      this.stats.successfulVerifications++
    } else {
      this.stats.failedVerifications++
    }
    if (log.bot) {
      this.stats.botAttempts++
    }

    // Update domain stats
    const siteKey = this.siteKeys.get(log.siteKey)
    if (siteKey) {
      this.stats.byDomain[siteKey.domain] = (this.stats.byDomain[siteKey.domain] || 0) + 1
    }

    // Update country stats
    if (log.country) {
      this.stats.byCountry[log.country] = (this.stats.byCountry[log.country] || 0) + 1
    }
  }

  getLogs(limit = 100): VerificationLog[] {
    return this.logs.slice(-limit).reverse()
  }

  getStatistics(): Statistics & { recentLogs: VerificationLog[] } {
    return {
      ...this.stats,
      recentLogs: this.getLogs(10),
    }
  }

  private cleanupOldLogs(): void {
    if (this.logs.length > 10000) {
      this.logs = this.logs.slice(-10000)
    }
  }

  // Utility
  private generateId(length: number): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    let result = ""
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }
}

// Singleton instance
export const captchaStorage = new CaptchaStorage()
