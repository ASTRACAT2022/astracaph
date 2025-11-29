import { NextResponse } from "next/server"
import { captchaStorage } from "@/lib/captcha/storage"
import bcrypt from "bcrypt"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const user = captchaStorage.getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const siteKeyData = captchaStorage.getSiteKey(user.siteKey)
    const sessionToken = captchaStorage.createSessionToken(user.id)

    const session = {
      user: { id: user.id, email: user.email },
      siteKey: {
        publicKey: siteKeyData?.publicKey,
        domain: siteKeyData?.domain,
      },
      token: sessionToken,
    }

    return NextResponse.json(session)
  } catch (error: any) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
