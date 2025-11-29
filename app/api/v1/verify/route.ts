import { type NextRequest, NextResponse } from "next/server"
import { CaptchaSecurityService } from "@/lib/captcha/security"
import { captchaStorage } from "@/lib/captcha/storage"
import type { CaptchaVerificationRequest, CaptchaVerificationResponse } from "@/lib/captcha/types"

export async function POST(request: NextRequest) {
  try {
    const body: CaptchaVerificationRequest = await request.json()
    const { token, userResponse } = body

    // Validate inputs
    if (!token || !userResponse) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Rate limiting
    const clientIp = CaptchaSecurityService.getClientIp(request.headers)
    if (!captchaStorage.checkRateLimit(clientIp, 10, 60000)) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
    }

    // Verify token signature
    if (!CaptchaSecurityService.verifyToken(token)) {
      return NextResponse.json({
        success: false,
        score: 0,
        bot: true,
        details: {
          reasons: ["Invalid token signature"],
          timestamp: Date.now(),
        },
      } as CaptchaVerificationResponse)
    }

    // Get challenge
    const challenge = captchaStorage.getChallenge(token)
    if (!challenge) {
      return NextResponse.json({
        success: false,
        score: 0,
        bot: true,
        details: {
          reasons: ["Challenge not found or expired"],
          timestamp: Date.now(),
        },
      } as CaptchaVerificationResponse)
    }


    // Check if already solved (prevent replay attacks)
    if (challenge.solved) {
      return NextResponse.json({
        success: false,
        score: 0,
        bot: true,
        details: {
          reasons: ["Challenge already used"],
          timestamp: Date.now(),
        },
      } as CaptchaVerificationResponse)
    }

    // Check attempt limit
    if (challenge.attempts >= 3) {
      captchaStorage.deleteChallenge(token)
      return NextResponse.json({
        success: false,
        score: 0,
        bot: true,
        details: {
          reasons: ["Too many attempts"],
          timestamp: Date.now(),
        },
      } as CaptchaVerificationResponse)
    }

    // Increment attempts
    captchaStorage.incrementChallengeAttempts(token)

    // Perform bot detection
    const userAgent = request.headers.get("user-agent") || undefined
    const botDetection = CaptchaSecurityService.detectBot({
      userAgent,
      interactionTime: userResponse.interactionTime,
      mouseMovements: userResponse.mouseMovements,
      timings: userResponse.timings,
      canvasFingerprint: userResponse.canvasFingerprint,
      webglFingerprint: userResponse.webglFingerprint,
    })

    const success = !botDetection.isBot && botDetection.score >= 50

    // Mark as solved if successful
    if (success) {
      captchaStorage.markChallengeSolved(token)
    }

    // Log verification
    const country = CaptchaSecurityService.getClientCountry(request.headers)
    captchaStorage.addLog({
      success,
      ip: clientIp,
      userAgent,
      country,
      bot: botDetection.isBot,
      score: botDetection.score,
      siteKey: challenge.siteKey,
    })

    const response: CaptchaVerificationResponse = {
      success,
      score: botDetection.score,
      bot: botDetection.isBot,
      details: {
        reasons: botDetection.reasons,
        timestamp: Date.now(),
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("[v0] Verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const runtime = "nodejs"
