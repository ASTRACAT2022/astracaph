"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { CheckCircle2, XCircle, Shield, Activity, Globe, Users, Key, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

interface Session {
  user: {
    id: string
    email: string
  }
  siteKey: {
    publicKey: string
    domain: string
  }
}

interface Statistics {
  totalVerifications: number
  successfulVerifications: number
  failedVerifications: number
  botAttempts: number
  byDomain: Record<string, number>
  byCountry: Record<string, number>
  recentLogs: Array<{
    timestamp: number
    success: boolean
    ip?: string
    country?: string
    bot: boolean
    score: number
  }>
}

export function DashboardContent() {
  const [session, setSession] = useState<Session | null>(null)
  const [stats, setStats] = useState<Statistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [copiedHtml, setCopiedHtml] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const sessionData = localStorage.getItem("astra-session")
    if (!sessionData) {
      router.push("/login")
      return
    }
    setSession(JSON.parse(sessionData))
    loadData()
    const interval = setInterval(loadData, 5000)
    return () => clearInterval(interval)
  }, [router])

  const loadData = async () => {
    try {
      const statsRes = await fetch("/api/admin/stats")
      const statsData = await statsRes.json()
      setStats(statsData)
    } catch (error) {
      console.error("[v0] Failed to load data:", error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const copyHtmlToClipboard = (html: string) => {
    navigator.clipboard.writeText(html)
    setCopiedHtml(true)
    setTimeout(() => setCopiedHtml(false), 2000)
  }

  if (loading || !session) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Shield className="w-12 h-12 animate-pulse text-cyan-400" />
      </div>
    )
  }

  const successRate =
    stats && stats.totalVerifications > 0
      ? ((stats.successfulVerifications / stats.totalVerifications) * 100).toFixed(1)
      : "0"

  const botRate =
    stats && stats.totalVerifications > 0 ? ((stats.botAttempts / stats.totalVerifications) * 100).toFixed(1) : "0"

  const integrationHtml = `<div id="astracaph-widget"></div>
<script src="${window.location.origin}/captcha/widget.js" data-sitekey="${session.siteKey.publicKey}" data-theme="dark" async defer></script>`

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Welcome Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white">Welcome, {session.user.email}</h1>
        <p className="text-zinc-400">Here's an overview of your CAPTCHA performance.</p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Verifications */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Total Verifications</CardTitle>
              <Activity className="w-4 h-4 text-zinc-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats?.totalVerifications.toLocaleString() || 0}</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Success Rate */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Success Rate</CardTitle>
              <CheckCircle2 className="w-4 h-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{successRate}%</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bot Attempts */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Bot Attempts</CardTitle>
              <Shield className="w-4 h-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">{stats?.botAttempts || 0}</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Integration & Site Key */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Integration Code</CardTitle>
              <CardDescription className="text-zinc-400">
                Paste this snippet into your HTML where you want the CAPTCHA to appear.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-zinc-900 p-4 rounded-lg relative">
                <pre className="text-cyan-400 text-sm overflow-x-auto">
                  <code>{integrationHtml}</code>
                </pre>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyHtmlToClipboard(integrationHtml)}
                  className="absolute top-2 right-2 h-7 w-7 p-0"
                >
                  {copiedHtml ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Your Site Key</CardTitle>
              <CardDescription className="text-zinc-400">
                Domain: {session.siteKey.domain}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-400 w-24">Public Key:</span>
                <code className="flex-1 text-sm bg-zinc-900 px-2 py-1 rounded text-cyan-400 font-mono truncate">
                  {session.siteKey.publicKey}
                </code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(session.siteKey.publicKey, "publicKey")}
                  className="h-7 w-7 p-0"
                >
                  {copiedKey === "publicKey" ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Recent Verifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats?.recentLogs && stats.recentLogs.length > 0 ? (
                stats.recentLogs
                  .slice(0, 10)
                  .map((log, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg text-sm"
                    >
                      <div className="flex items-center gap-3">
                        {log.success ? (
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400" />
                        )}
                        <span className="text-zinc-300">{log.ip || "Unknown IP"}</span>
                        {log.country && (
                          <span className="text-xs text-zinc-500 px-2 py-0.5 bg-zinc-800 rounded">
                            {log.country}
                          </span>
                        )}
                        {log.bot && (
                          <span className="text-xs text-red-400 px-2 py-0.5 bg-red-500/10 rounded">BOT</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-zinc-500">Score: {log.score}</span>
                        <span className="text-xs text-zinc-600">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-8 text-zinc-500 text-sm">No recent verifications</div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Domain & Country Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                <CardTitle className="text-white">Top Domains</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats?.byDomain && Object.keys(stats.byDomain).length > 0 ? (
                  Object.entries(stats.byDomain)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                    .map(([domain, count]) => (
                      <div key={domain} className="flex items-center justify-between">
                        <span className="text-sm text-zinc-300">{domain}</span>
                        <span className="text-sm font-medium text-cyan-400">{count}</span>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-4 text-zinc-500 text-sm">No domain data</div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <CardTitle className="text-white">Top Countries</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats?.byCountry && Object.keys(stats.byCountry).length > 0 ? (
                  Object.entries(stats.byCountry)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                    .map(([country, count]) => (
                      <div key={country} className="flex items-center justify-between">
                        <span className="text-sm text-zinc-300">{country}</span>
                        <span className="text-sm font-medium text-cyan-400">{count}</span>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-4 text-zinc-500 text-sm">No country data</div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
