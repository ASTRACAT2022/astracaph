import { type NextRequest, NextResponse } from "next/server"
import { captchaStorage } from "@/lib/captcha/storage"

type AuthenticatedHandler = (req: NextRequest, session: any) => Promise<Response>

export function withAuth(handler: AuthenticatedHandler) {
  return async (req: NextRequest) => {
    const authHeader = req.headers.get("Authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const token = authHeader.substring(7)
    const user = captchaStorage.getUserBySessionToken(token)

    if (!user) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    const session = { user: { id: user.id, email: user.email } }
    return handler(req, session)
  }
}
