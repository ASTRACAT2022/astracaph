import { NextResponse } from "next/server"
import { captchaStorage } from "@/lib/captcha/storage"
import { withAuth } from "@/lib/middleware/auth"

async function handler() {
  try {
    const stats = captchaStorage.getStatistics()
    return NextResponse.json(stats)
  } catch (error) {
    console.error("[STATS_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export const GET = withAuth(handler)
