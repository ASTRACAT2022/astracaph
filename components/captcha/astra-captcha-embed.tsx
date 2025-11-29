"use client"

import { useEffect, useState } from "react"

interface AstraCaptchaEmbedProps {
  siteKey: string
  onSuccess?: (token: string) => void
  onError?: (error: string) => void
  theme?: "dark" | "light"
}

export function AstraCaptchaEmbed({ siteKey, onSuccess, onError, theme = "dark" }: AstraCaptchaEmbedProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleVerify = (token: string, success: boolean) => {
    if (success && onSuccess) {
      onSuccess(token)
    } else if (!success && onError) {
      onError("Verification failed")
    }
  }

  if (!mounted) {
    return <div className="w-full max-w-md h-64 bg-zinc-950 border border-zinc-800 rounded-lg animate-pulse" />
  }

  return (
    <div className="w-full max-w-md">
      <iframe
        src={`/captcha/widget?siteKey=${siteKey}&theme=${theme}`}
        className="w-full h-64 border-0 rounded-lg"
        title="AstraCaph CAPTCHA"
        sandbox="allow-scripts allow-same-origin allow-forms"
      />
    </div>
  )
}
