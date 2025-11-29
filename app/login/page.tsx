import Link from "next/link"
import { Shield } from "lucide-react"
import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 rounded-lg">
              <Shield className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-white">AstraCaph</h1>
              <p className="text-sm text-zinc-400">Sign in to your account</p>
            </div>
          </Link>
        </div>
        <LoginForm />
        <p className="text-center text-sm text-zinc-400 mt-6">
          Don't have an account?{" "}
          <Link href="/register" className="text-cyan-400 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}
