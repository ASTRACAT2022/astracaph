import { NextResponse } from "next/server"
import { captchaStorage } from "@/lib/captcha/storage"

export async function GET(
  request: Request,
  { params }: { params: { publicKey: string } }
) {
  try {
    const { publicKey } = params
    const authHeader = request.headers.get("Authorization")
    const token = authHeader?.split(" ")[1]

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = captchaStorage.getUserBySessionToken(token)
    if (!user || user.siteKey !== publicKey) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const allStats = captchaStorage.getStatistics()
    const siteKeyLogs = allStats.recentLogs.filter(log => log.siteKey === publicKey)

    const siteKeyStats = {
      totalVerifications: siteKeyLogs.length,
      successfulVerifications: siteKeyLogs.filter(l => l.success).length,
      failedVerifications: siteKeyLogs.filter(l => !l.success).length,
      botAttempts: siteKeyLogs.filter(l => l.bot).length,
      recentLogs: siteKeyLogs,
    }

    return NextResponse.json(siteKeyStats)
  } catch (error) {
    console.error(`[API] Error fetching stats for ${params.publicKey}:`, error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
