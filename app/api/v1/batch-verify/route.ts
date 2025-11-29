import { type NextRequest, NextResponse } from "next/server"
import { CaptchaSecurityService } from "@/lib/captcha/security"
import { captchaStorage } from "@/lib/captcha/storage"

interface BatchVerifyRequest {
  secretKey: string
  verifications: Array<{
    token: string
    userResponse: any
  }>
}

export async function POST(request: NextRequest) {
  try {
    const body: BatchVerifyRequest = await request.json()
    const { secretKey, verifications } = body

    if (!verifications || !Array.isArray(verifications) || verifications.length === 0) {
      return NextResponse.json({ error: "Verifications array is required" }, { status: 400 })
    }

    if (verifications.length > 10) {
      return NextResponse.json({ error: "Maximum 10 verifications per batch" }, { status: 400 })
    }

    const results = []

    for (const verification of verifications) {
      const { token, userResponse } = verification

      // Verify token signature
      if (!CaptchaSecurityService.verifyToken(token)) {
        results.push({
          token,
          success: false,
          score: 0,
          bot: true,
          error: "Invalid token signature",
        })
        continue
      }

      // Get challenge
      const challenge = captchaStorage.getChallenge(token)
      if (!challenge) {
        results.push({
          token,
          success: false,
          score: 0,
          bot: true,
          error: "Challenge not found or expired",
        })
        continue
      }

      // Verify secret key
      if (!captchaStorage.validateSiteKey(challenge.siteKey, secretKey)) {
        results.push({
          token,
          success: false,
          score: 0,
          bot: true,
          error: "Invalid secret key",
        })
        continue
      }

      // Perform bot detection
      const userAgent = request.headers.get("user-agent") || undefined
      const botDetection = CaptchaSecurityService.detectBot({
        userAgent,
        ...userResponse,
      })

      const success = !botDetection.isBot && botDetection.score >= 50

      if (success) {
        captchaStorage.markChallengeSolved(token)
      }

      results.push({
        token,
        success,
        score: botDetection.score,
        bot: botDetection.isBot,
        reasons: botDetection.reasons,
      })
    }

    return NextResponse.json({
      success: true,
      results,
      total: verifications.length,
      verified: results.filter((r) => r.success).length,
    })
  } catch (error) {
    console.error("[v0] Batch verify error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const runtime = "edge"
