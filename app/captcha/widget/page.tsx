"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { AstraCaptchaWidget } from "@/components/captcha/astra-captcha-widget"

function WidgetContent() {
  const searchParams = useSearchParams()
  const siteKey = searchParams.get("siteKey") || "demo"
  const theme = (searchParams.get("theme") as "dark" | "light") || "dark"

  const handleVerify = (token: string, success: boolean) => {
    // Send message to parent window
    window.parent.postMessage(
      {
        type: "astra-captcha-result",
        token,
        success,
      },
      "*",
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-transparent">
      <AstraCaptchaWidget siteKey={siteKey} onVerify={handleVerify} theme={theme} />
    </div>
  )
}

export default function WidgetPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-transparent" />}>
      <WidgetContent />
    </Suspense>
  )
}
