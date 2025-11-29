"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { CheckCircle2, XCircle, Shield, Activity, Globe, Users, Key, Plus, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import DashboardSkeleton from "@/components/admin/dashboard-skeleton" // Import DashboardSkeleton

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

interface SiteKey {
  publicKey: string
  secretKey: string
  domain: string
  enabled: boolean
  createdAt: number
}

export function DashboardContent() {
  const [stats, setStats] = useState<Statistics | null>(null)
  const [siteKeys, setSiteKeys] = useState<SiteKey[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 5000) // Refresh every 5 seconds
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    try {
      const [statsRes, keysRes] = await Promise.all([fetch("/api/admin/stats"), fetch("/api/admin/site-keys")])

      const statsData = await statsRes.json()
      const keysData = await keysRes.json()

      setStats(statsData)
      setSiteKeys(keysData.siteKeys || [])
    } catch (error) {
      console.error("[v0] Failed to load data:", error)
    } finally {
      setLoading(false)
    }
  }

  const createSiteKey = async () => {
    const domain = prompt("Enter domain (e.g., example.com or * for all):")
    if (!domain) return

    try {
      const res = await fetch("/api/admin/site-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain }),
      })

      if (res.ok) {
        await loadData()
      }
    } catch (error) {
      console.error("[v0] Failed to create site key:", error)
    }
  }

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  if (loading) {
    return <DashboardSkeleton />
  }

  const successRate =
    stats && stats.totalVerifications > 0
      ? ((stats.successfulVerifications / stats.totalVerifications) * 100).toFixed(1)
      : "0"

  const botRate =
    stats && stats.totalVerifications > 0 ? ((stats.botAttempts / stats.totalVerifications) * 100).toFixed(1) : "0"

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Total Verifications</CardTitle>
              <Activity className="w-4 h-4 text-zinc-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats?.totalVerifications.toLocaleString() || 0}</div>
              <p className="text-xs text-zinc-500 mt-1">All time verifications</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Success Rate</CardTitle>
              <CheckCircle2 className="w-4 h-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{successRate}%</div>
              <p className="text-xs text-zinc-500 mt-1">{stats?.successfulVerifications || 0} successful</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Bot Attempts</CardTitle>
              <Shield className="w-4 h-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">{stats?.botAttempts || 0}</div>
              <p className="text-xs text-zinc-500 mt-1">{botRate}% of total</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">Site Keys</CardTitle>
                  <CardDescription className="text-zinc-400">Manage your API keys and domains</CardDescription>
                </div>
                <Button onClick={createSiteKey} className="bg-cyan-500 hover:bg-cyan-600 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Site Key
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {siteKeys.map((key) => (
                  <div key={key.publicKey} className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Key className="w-4 h-4 text-cyan-400" />
                        <span className="text-sm font-medium text-white">{key.domain}</span>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          key.enabled ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {key.enabled ? "Active" : "Disabled"}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-500 w-20">Public:</span>
                        <code className="flex-1 text-xs bg-zinc-900 px-2 py-1 rounded text-cyan-400 font-mono">
                          {key.publicKey}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(key.publicKey, key.publicKey)}
                          className="h-7 w-7 p-0"
                        >
                          {copiedKey === key.publicKey ? (
                            <Check className="w-3 h-3 text-green-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-500 w-20">Secret:</span>
                        <code className="flex-1 text-xs bg-zinc-900 px-2 py-1 rounded text-pink-400 font-mono">
                          {key.secretKey.substring(0, 20)}...
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(key.secretKey, key.secretKey)}
                          className="h-7 w-7 p-0"
                        >
                          {copiedKey === key.secretKey ? (
                            <Check className="w-3 h-3 text-green-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                      </div>

                      <div className="text-xs text-zinc-500 mt-2">
                        Created: {new Date(key.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Recent Verifications</CardTitle>
              <CardDescription className="text-zinc-400">Latest verification attempts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats?.recentLogs.slice(0, 10).map((log, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg text-sm">
                    <div className="flex items-center gap-3">
                      {log.success ? (
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400" />
                      )}
                      <span className="text-zinc-300">{log.ip || "Unknown IP"}</span>
                      {log.country && (
                        <span className="text-xs text-zinc-500 px-2 py-0.5 bg-zinc-800 rounded">{log.country}</span>
                      )}
                      {log.bot && <span className="text-xs text-red-400 px-2 py-0.5 bg-red-500/10 rounded">BOT</span>}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-zinc-500">Score: {log.score}</span>
                      <span className="text-xs text-zinc-600">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}

                {(!stats?.recentLogs || stats.recentLogs.length === 0) && (
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
                  {Object.entries(stats?.byDomain || {})
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                    .map(([domain, count]) => (
                      <div key={domain} className="flex items-center justify-between">
                        <span className="text-sm text-zinc-300">{domain}</span>
                        <span className="text-sm font-medium text-cyan-400">{count}</span>
                      </div>
                    ))}
                  {Object.keys(stats?.byDomain || {}).length === 0 && (
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
                  {Object.entries(stats?.byCountry || {})
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                    .map(([country, count]) => (
                      <div key={country} className="flex items-center justify-between">
                        <span className="text-sm text-zinc-300">{country}</span>
                        <span className="text-sm font-medium text-cyan-400">{count}</span>
                      </div>
                    ))}
                  {Object.keys(stats?.byCountry || {}).length === 0 && (
                    <div className="text-center py-4 text-zinc-500 text-sm">No country data</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
