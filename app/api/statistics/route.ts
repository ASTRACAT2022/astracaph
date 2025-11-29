
import { NextResponse } from "next/server";
import { captchaStorage } from "@/lib/captcha/storage";

export async function GET() {
  try {
    const stats = captchaStorage.getStatistics();
    return NextResponse.json(stats);
  } catch (error) {
    console.error("[v0] Statistics error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export const runtime = "nodejs";
