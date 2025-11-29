import { type NextRequest, NextResponse } from "next/server"
import { CaptchaSecurityService } from "@/lib/captcha/security"
import { captchaStorage } from "@/lib/captcha/storage"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 })
    }

    // Verify token signature
    if (!CaptchaSecurityService.verifyToken(token)) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Get challenge
    const challenge = captchaStorage.getChallenge(token)
    if (!challenge) {
      return NextResponse.json({ error: "Challenge not found or expired" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      expiresAt: challenge.expiresAt,
      attempts: challenge.attempts,
    })
  } catch (error) {
    console.error("[v0] Challenge check error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const runtime = "nodejs"
