import { NextResponse } from "next/server"
import { captchaStorage } from "@/lib/captcha/storage"
import bcrypt from "bcrypt"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const user = captchaStorage.createUser(email, passwordHash)
    const siteKeyData = captchaStorage.getSiteKey(user.siteKey)

    // Return a session object without the secret key
    const session = {
      user: { id: user.id, email: user.email },
      siteKey: {
        publicKey: siteKeyData?.publicKey,
        domain: siteKeyData?.domain,
      },
    }

    return NextResponse.json(session)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
