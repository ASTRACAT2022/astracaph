"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { AstraCaptchaWidget } from "@/components/captcha/astra-captcha-widget"

function WidgetContent() {
  const searchParams = useSearchParams()
  const siteKey = searchParams.get("siteKey")
  const theme = (searchParams.get("theme") as "dark" | "light") || "dark"

  if (!siteKey) {
    return <p className="text-red-500">Site key is missing.</p>
  }

  const handleVerify = (token: string, success: boolean) => {
    window.parent.postMessage({
      type: 'astracaph-verified',
      detail: { token, success }
    }, '*')
  }

  return (
    <div className="flex items-center justify-center bg-transparent">
      <AstraCaptchaWidget siteKey={siteKey} onVerify={handleVerify} theme={theme} />
    </div>
  )
}

export default function WidgetPage() {
  return (
    <Suspense fallback={<div />}>
      <WidgetContent />
    </Suspense>
  )
}
