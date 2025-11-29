"use client"

import { useState, useEffect, useRef } from "react"
import { motion, useMotionValue, useTransform } from "framer-motion"
import { Loader2, CheckCircle2, XCircle, Shield } from "lucide-react"

interface AstraCaptchaWidgetProps {
  siteKey: string
  onVerify: (token: string, success: boolean) => void
  theme?: "dark" | "light"
}

interface Challenge {
  token: string
  type: "drag" | "puzzle" | "fallback"
  data: {
    targetX?: number
    targetY?: number
    rotation?: number
  }
  expiresAt: number
}

export function AstraCaptchaWidget({ siteKey, onVerify, theme = "dark" }: AstraCaptchaWidgetProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "challenge" | "verifying" | "success" | "error">("idle")
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [errorMessage, setErrorMessage] = useState("")

  // Tracking data for bot detection
  const startTimeRef = useRef<number>(0)
  const mouseMovementsRef = useRef<number>(0)
  const timingsRef = useRef<number[]>([])
  const canvasFingerprintRef = useRef<string>("")
  const webglFingerprintRef = useRef<string>("")

  // Drag interaction
  const dragX = useMotionValue(0)
  const dragY = useMotionValue(0)
  const rotation = useTransform(dragX, [-100, 100], [-20, 20])

  useEffect(() => {
    // Generate fingerprints on mount
    generateFingerprints()

    // Track mouse movements
    const handleMouseMove = () => {
      mouseMovementsRef.current++
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  const generateFingerprints = () => {
    // Canvas fingerprint
    try {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (ctx) {
        canvas.width = 200
        canvas.height = 50
        ctx.textBaseline = "top"
        ctx.font = "14px Arial"
        ctx.fillStyle = "#f60"
        ctx.fillRect(125, 1, 62, 20)
        ctx.fillStyle = "#069"
        ctx.fillText("AstraCat", 2, 15)
        canvasFingerprintRef.current = canvas.toDataURL()
      }
    } catch (e) {
      canvasFingerprintRef.current = "error"
    }

    // WebGL fingerprint
    try {
      const canvas = document.createElement("canvas")
      const gl = canvas.getContext("webgl")
      if (gl) {
        const debugInfo = gl.getExtension("WEBGL_debug_renderer_info")
        if (debugInfo) {
          const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
          const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
          webglFingerprintRef.current = `${vendor}~${renderer}`
        } else {
          webglFingerprintRef.current = "no-debug-info"
        }
      }
    } catch (e) {
      webglFingerprintRef.current = "error"
    }
  }

  const initChallenge = async () => {
    setStatus("loading")
    setErrorMessage("")
    startTimeRef.current = Date.now()
    mouseMovementsRef.current = 0
    timingsRef.current = [Date.now()]

    try {
      const response = await fetch("/public/api/v1/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteKey }),
      })

      if (!response.ok) {
        throw new Error("Failed to load challenge")
      }

      const data = await response.json()
      setChallenge(data.challenge)
      setStatus("challenge")
      timingsRef.current.push(Date.now())
    } catch (error) {
      setStatus("error")
      setErrorMessage("Failed to load CAPTCHA")
    }
  }

  const handleDragEnd = async () => {
    if (!challenge) return

    const x = dragX.get()
    const y = dragY.get()
    const targetX = challenge.data.targetX || 0
    const targetY = challenge.data.targetY || 0

    // Check if close enough to target (within 30px tolerance)
    const distance = Math.sqrt(Math.pow(x - targetX, 2) + Math.pow(y - targetY, 2))

    if (distance > 30) {
      // Reset position
      dragX.set(0)
      dragY.set(0)
      timingsRef.current.push(Date.now())
      return
    }

    setStatus("success")
    onVerify(challenge.token, true)
  }

  const isDark = theme === "dark"

  return (
    <div
      className={`relative ${isDark ? "bg-zinc-950" : "bg-white"} border ${isDark ? "border-zinc-800" : "border-zinc-200"} rounded-lg p-6 w-full max-w-md`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg ${isDark ? "bg-cyan-500/10" : "bg-cyan-50"}`}>
          <Shield className={`w-5 h-5 ${isDark ? "text-cyan-400" : "text-cyan-600"}`} />
        </div>
        <div className="flex-1">
          <h3 className={`text-sm font-medium ${isDark ? "text-white" : "text-zinc-900"}`}>AstraCaph</h3>
          <p className={`text-xs ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>Security Verification</p>
        </div>
        <div className="text-xs text-cyan-400 font-mono">v1.0</div>
      </div>

      {/* Content */}
      <div className="relative">
        {status === "idle" && (
          <motion.button
            onClick={initChallenge}
            className={`w-full py-4 rounded-lg border-2 ${
              isDark
                ? "border-zinc-800 bg-zinc-900 hover:bg-zinc-800 hover:border-cyan-500/50"
                : "border-zinc-200 bg-zinc-50 hover:bg-zinc-100 hover:border-cyan-400"
            } transition-all duration-200 flex items-center justify-center gap-2 group`}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <Shield
              className={`w-5 h-5 ${isDark ? "text-zinc-400 group-hover:text-cyan-400" : "text-zinc-600 group-hover:text-cyan-600"} transition-colors`}
            />
            <span className={`font-medium ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>Verify you're human</span>
          </motion.button>
        )}

        {status === "loading" && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className={`w-8 h-8 animate-spin ${isDark ? "text-cyan-400" : "text-cyan-600"}`} />
          </div>
        )}

        {status === "challenge" && challenge && (
          <div className="space-y-4">
            <p className={`text-sm text-center ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>
              Drag the shield to the target position
            </p>

            <div
              className={`relative h-48 rounded-lg ${isDark ? "bg-zinc-900/50" : "bg-zinc-100"} border ${isDark ? "border-zinc-800" : "border-zinc-200"} overflow-hidden`}
            >
              {/* Target indicator */}
              <motion.div
                className="absolute w-12 h-12 rounded-full border-2 border-dashed border-cyan-500/50"
                style={{
                  left: challenge.data.targetX,
                  top: challenge.data.targetY,
                }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              />

              {/* Draggable shield */}
              <motion.div
                drag
                dragConstraints={{ left: 0, right: 300, top: 0, bottom: 150 }}
                dragElastic={0.1}
                onDragEnd={handleDragEnd}
                style={{ x: dragX, y: dragY, rotate: rotation }}
                className="absolute cursor-grab active:cursor-grabbing"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="p-3 bg-cyan-500 rounded-full shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {status === "verifying" && (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <Loader2 className={`w-8 h-8 animate-spin ${isDark ? "text-cyan-400" : "text-cyan-600"}`} />
            <p className={`text-sm ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>Verifying...</p>
          </div>
        )}

        {status === "success" && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center justify-center py-8 gap-3"
          >
            <div className="p-3 bg-green-500/10 rounded-full">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <p className={`text-sm font-medium ${isDark ? "text-green-400" : "text-green-600"}`}>
              Verification successful
            </p>
          </motion.div>
        )}

        {status === "error" && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center justify-center py-8 gap-3"
          >
            <div className="p-3 bg-red-500/10 rounded-full">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <p className={`text-sm font-medium ${isDark ? "text-red-400" : "text-red-600"}`}>
              {errorMessage || "Verification failed"}
            </p>
            <button
              onClick={() => setStatus("idle")}
              className={`text-xs ${isDark ? "text-cyan-400 hover:text-cyan-300" : "text-cyan-600 hover:text-cyan-700"} underline`}
            >
              Try again
            </button>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between text-xs">
        <span className={isDark ? "text-zinc-500" : "text-zinc-400"}>Protected by AstraCaph</span>
        <a
          href="https://astracat.ru"
          target="_blank"
          rel="noopener noreferrer"
          className={`${isDark ? "text-cyan-400 hover:text-cyan-300" : "text-cyan-600 hover:text-cyan-700"} transition-colors`}
        >
          Learn more
        </a>
      </div>
    </div>
  )
}
