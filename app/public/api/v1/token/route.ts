import { type NextRequest, NextResponse } from "next/server"
import { CaptchaSecurityService } from "@/lib/captcha/security"
import { captchaStorage } from "@/lib/captcha/storage"
import type { CaptchaChallenge } from "@/lib/captcha/types"

export async function POST(request: NextRequest) {
  try {
    const { siteKey } = await request.json()

    // Validate site key
    const siteKeyData = captchaStorage.getSiteKey(siteKey)
    if (!siteKeyData || !siteKeyData.enabled) {
      return NextResponse.json({ error: "Invalid site key" }, { status: 401 })
    }

    // Rate limiting by IP
    const clientIp = CaptchaSecurityService.getClientIp(request.headers)
    if (!captchaStorage.checkRateLimit(clientIp, 20, 60000)) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
    }

    // Generate secure token
    const token = CaptchaSecurityService.generateToken()

    // Create challenge
    const challengeType = Math.random() > 0.3 ? "drag" : "puzzle"
    const challenge: CaptchaChallenge = {
      token,
      type: challengeType,
      data:
        challengeType === "drag"
          ? {
              targetX: Math.floor(Math.random() * 200) + 50,
              targetY: Math.floor(Math.random() * 100) + 50,
              rotation: Math.floor(Math.random() * 360),
            }
          : {
              // Simple puzzle data
              targetX: Math.floor(Math.random() * 300) + 50,
              targetY: Math.floor(Math.random() * 200) + 50,
            },
      expiresAt: Date.now() + 300000, // 5 minutes
    }

    // Store challenge
    captchaStorage.createChallenge(token, siteKey)

    return NextResponse.json({
      success: true,
      challenge,
      canvasChallenge: CaptchaSecurityService.generateCanvasChallenge(),
    })
  } catch (error) {
    console.error("[v0] Token generation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const runtime = "nodejs"
