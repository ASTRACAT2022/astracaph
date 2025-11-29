import { NextResponse } from "next/server";
import { captchaStorage } from "@/lib/captcha/storage";
import crypto from "crypto";

export const runtime = "nodejs";

export async function POST() {
  try {
    const siteKey = `pk_${crypto.randomBytes(16).toString("hex")}`;
    const secretKey = `sk_${crypto.randomBytes(32).toString("hex")}`;

    const newSiteKey = {
      key: siteKey,
      secret: secretKey,
      domains: [],
      createdAt: new Date(),
    };

    captchaStorage.siteKeys.set(siteKey, newSiteKey);

    return NextResponse.json(
      {
        siteKey: newSiteKey.key,
        secretKey: newSiteKey.secret,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating site key:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
