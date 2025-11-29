"use client"

import { Suspense, useState, useEffect } from "react"
import Link from "next/link"
import { Shield, Zap, Lock, BarChart3, ArrowRight, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AstraCaptchaWidget } from "@/components/captcha/astra-captcha-widget"

export default function HomePage() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/statistics")
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error("Failed to fetch stats:", error)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500/10 rounded-lg">
                <Shield className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white">AstraCaph</h1>
                <p className="text-xs text-zinc-400">Modern CAPTCHA System</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/documentation">
                <Button variant="ghost" className="text-zinc-300 hover:text-white">
                  Documentation
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-block px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-sm font-medium">
                v1.0 - No External Dependencies
              </div>
              <h1 className="text-5xl font-bold text-white leading-tight">
                Protect your forms with{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                  modern security
                </span>
              </h1>
              <p className="text-lg text-zinc-400 leading-relaxed">
                AstraCaph is a lightweight, fast, and secure CAPTCHA system built without external integrations.
                Everything runs in your infrastructure.
              </p>
              <div className="flex gap-4">
                <Link href="/documentation">
                  <Button className="bg-cyan-500 hover:bg-cyan-600 text-white">
                    View Documentation
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>

              {/* Features List */}
              <div className="grid grid-cols-2 gap-4 pt-8">
                {[
                  "No external dependencies",
                  "Sub-100ms response time",
                  "Advanced bot detection",
                  "Real-time analytics",
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm text-zinc-300">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Demo */}
            <div className="flex justify-center">
              <Suspense fallback={<div className="w-full max-w-md h-64 bg-zinc-900 rounded-lg animate-pulse" />}>
                <AstraCaptchaWidget
                  siteKey="demo"
                  onVerify={(token, success) => {
                    console.log("Demo verification:", { token, success })
                  }}
                  theme="dark"
                />
              </Suspense>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Built for modern applications</h2>
            <p className="text-zinc-400">Everything you need for secure form protection</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: "Lightning Fast",
                description: "Sub-100ms response times with edge computing and efficient algorithms",
              },
              {
                icon: Lock,
                title: "Secure by Default",
                description: "HMAC signatures, rate limiting, and advanced bot detection built-in",
              },
              {
                icon: BarChart3,
                title: "Deep Analytics",
                description: "Real-time insights into threats, performance, and user behavior",
              },
            ].map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-lg hover:border-cyan-500/50 transition-all"
                >
                  <div className="p-3 bg-cyan-500/10 rounded-lg w-fit mb-4">
                    <Icon className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {stats && (
        <section className="py-20 px-6 border-t border-zinc-800">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Live Statistics</h2>
              <p className="text-zinc-400">Real-time data from our CAPTCHA system</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                <h3 className="text-xl font-semibold text-white mb-2">Total Verifications</h3>
                <p className="text-3xl font-bold text-cyan-400">{stats.totalVerifications}</p>
              </div>
              <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                <h3 className="text-xl font-semibold text-white mb-2">Successful</h3>
                <p className="text-3xl font-bold text-green-400">{stats.successfulVerifications}</p>
              </div>
              <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                <h3 className="text-xl font-semibold text-white mb-2">Failed</h3>
                <p className="text-3xl font-bold text-red-400">{stats.failedVerifications}</p>
              </div>
              <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                <h3 className="text-xl font-semibold text-white mb-2">Bot Attempts</h3>
                <p className="text-3xl font-bold text-yellow-400">{stats.botAttempts}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8 px-6 mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-400 text-sm">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>AstraCaph v1.0</span>
            </div>
            <div className="text-zinc-500 text-sm">Built by ASTRACAT - No external dependencies</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
