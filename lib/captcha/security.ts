import crypto from "crypto"

const SECRET_SIGNING_KEY = process.env.CAPTCHA_SECRET_KEY || "astracat-captcha-secret-key-change-in-production"

export interface BotDetectionResult {
  isBot: boolean
  score: number // 0-100, higher is more human-like
  reasons: string[]
}

export class CaptchaSecurityService {
  // Generate secure token with HMAC signature
  static generateToken(): string {
    const randomBytes = crypto.randomBytes(32).toString("hex")
    const timestamp = Date.now().toString()
    const payload = `${randomBytes}.${timestamp}`
    const signature = this.sign(payload)
    return `${payload}.${signature}`
  }

  // Verify token signature
  static verifyToken(token: string): boolean {
    const parts = token.split(".")
    if (parts.length !== 3) return false

    const [randomPart, timestamp, signature] = parts
    const payload = `${randomPart}.${timestamp}`
    const expectedSignature = this.sign(payload)

    return signature === expectedSignature
  }

  // HMAC-SHA256 signing
  private static sign(data: string): string {
    return crypto.createHmac("sha256", SECRET_SIGNING_KEY).update(data).digest("hex")
  }

  // Bot detection based on behavioral patterns
  static detectBot(data: {
    userAgent?: string
    interactionTime?: number // Time to complete challenge in ms
    mouseMovements?: number // Number of mouse move events
    timings?: number[] // Event timings
    canvasFingerprint?: string
    webglFingerprint?: string
  }): BotDetectionResult {
    let score = 100
    const reasons: string[] = []

    // Check User-Agent for bot signatures
    if (data.userAgent) {
      const botPatterns = [/headless/i, /phantom/i, /selenium/i, /puppeteer/i, /bot/i, /crawler/i, /spider/i]

      for (const pattern of botPatterns) {
        if (pattern.test(data.userAgent)) {
          score -= 30
          reasons.push("Suspicious user agent")
          break
        }
      }

      // Missing common browser features
      if (!data.userAgent.includes("Mozilla")) {
        score -= 20
        reasons.push("Non-standard user agent")
      }
    }

    // Check interaction time (too fast = bot, too slow = suspicious)
    if (data.interactionTime !== undefined) {
      if (data.interactionTime < 500) {
        score -= 40
        reasons.push("Completed too quickly")
      } else if (data.interactionTime > 120000) {
        score -= 20
        reasons.push("Took too long")
      }
    }

    // Check mouse movements
    if (data.mouseMovements !== undefined) {
      if (data.mouseMovements < 5) {
        score -= 25
        reasons.push("Insufficient mouse activity")
      }
    }

    // Check timing patterns for automation
    if (data.timings && data.timings.length > 2) {
      const intervals = []
      for (let i = 1; i < data.timings.length; i++) {
        intervals.push(data.timings[i] - data.timings[i - 1])
      }

      // Check if intervals are too uniform (bot-like)
      const variance = this.calculateVariance(intervals)
      if (variance < 100) {
        score -= 30
        reasons.push("Robotic timing pattern")
      }
    }

    // Check for missing fingerprints
    if (!data.canvasFingerprint || !data.webglFingerprint) {
      score -= 15
      reasons.push("Missing browser fingerprints")
    }

    // Ensure score stays within bounds
    score = Math.max(0, Math.min(100, score))

    return {
      isBot: score < 50,
      score,
      reasons,
    }
  }

  private static calculateVariance(numbers: number[]): number {
    if (numbers.length === 0) return 0
    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length
    const squaredDiffs = numbers.map((n) => Math.pow(n - mean, 2))
    return squaredDiffs.reduce((a, b) => a + b, 0) / numbers.length
  }

  // Generate canvas fingerprint challenge
  static generateCanvasChallenge(): string {
    const chars = "AstraCat CAPTCHA 🌟"
    return Buffer.from(chars).toString("base64")
  }

  // Verify canvas fingerprint (basic check)
  static verifyCanvasFingerprint(fingerprint: string): boolean {
    // Just check that it exists and looks valid
    return fingerprint && fingerprint.length > 20
  }

  // Extract IP from request headers (works with Vercel)
  static getClientIp(headers: Headers): string {
    return headers.get("x-forwarded-for")?.split(",")[0] || headers.get("x-real-ip") || "unknown"
  }

  // Extract country from request headers (Vercel provides this)
  static getClientCountry(headers: Headers): string {
    return headers.get("x-vercel-ip-country") || "unknown"
  }
}
