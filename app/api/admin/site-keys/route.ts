import { type NextRequest, NextResponse } from "next/server"
import { captchaStorage } from "@/lib/captcha/storage"

export async function GET(request: NextRequest) {
  try {
    // In production, add authentication here
    const siteKeys = captchaStorage.getAllSiteKeys()

    return NextResponse.json({ siteKeys })
  } catch (error) {
    console.error("[v0] Site keys error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // In production, add authentication here
    const { domain } = await request.json()

    if (!domain) {
      return NextResponse.json({ error: "Domain is required" }, { status: 400 })
    }

    const keys = captchaStorage.createSiteKey(domain)

    return NextResponse.json({
      success: true,
      ...keys,
    })
  } catch (error) {
    console.error("[v0] Create site key error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const runtime = "edge"
