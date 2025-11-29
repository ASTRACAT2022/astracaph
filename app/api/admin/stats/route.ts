import { type NextRequest, NextResponse } from "next/server"
import { captchaStorage } from "@/lib/captcha/storage"

export async function GET(request: NextRequest) {
  try {
    // In production, add authentication here
    const stats = captchaStorage.getStatistics()

    return NextResponse.json(stats)
  } catch (error) {
    console.error("[v0] Stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const runtime = "nodejs"
