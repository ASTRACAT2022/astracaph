import { NextResponse } from "next/server"
import { captchaStorage } from "@/lib/captcha/storage"

export async function GET() {
  try {
    const stats = captchaStorage.getStatistics()

    return NextResponse.json({
      status: "healthy",
      version: "1.0.0",
      uptime: process.uptime?.() || 0,
      statistics: {
        totalVerifications: stats.totalVerifications,
        successRate:
          stats.totalVerifications > 0
            ? ((stats.successfulVerifications / stats.totalVerifications) * 100).toFixed(2) + "%"
            : "0%",
      },
      timestamp: Date.now(),
    })
  } catch (error) {
    return NextResponse.json({ status: "unhealthy", error: "System check failed" }, { status: 500 })
  }
}

export const runtime = "edge"
