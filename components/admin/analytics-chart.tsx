"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Loader2, AlertTriangle } from "lucide-react"
import { useSession } from "@/hooks/use-session"

interface StatsData {
  totalVerifications: number
  successfulVerifications: number
  failedVerifications: number
  botAttempts: number
  recentLogs: {
    timestamp: number
    success: boolean
    bot: boolean
  }[]
}

export function AnalyticsChart() {
  const { session } = useSession()
  const [data, setData] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<"hour" | "day" | "week">("hour")

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.token) return

      setLoading(true)
      setError(null)
      try {
        const response = await fetch("/api/admin/statistics", {
          headers: {
            Authorization: `Bearer ${session.token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch statistics")
        }

        const stats = await response.json()
        setData(stats)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 10000) // Refresh every 10 seconds
    return () => clearInterval(interval)
  }, [session])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-red-400">
        <AlertTriangle className="w-8 h-8 mb-2" />
        <p>{error}</p>
      </div>
    )
  }

  if (!data) {
    return <div className="p-8 text-center text-zinc-500">No data available.</div>
  }

  // Note: The chart visualization part is simplified as the API just returns totals
  // A more complex API would be needed for time-series charts.
  const { totalVerifications, successfulVerifications, botAttempts } = data
  const successRate = totalVerifications > 0 ? ((successfulVerifications / totalVerifications) * 100).toFixed(1) : "0"

  return (
    <div className="space-y-4">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Verification Trends</h3>
          <p className="text-sm text-zinc-400">Real-time analytics and insights</p>
        </div>
        <div className="flex gap-2">
          {(["hour", "day", "week"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                timeRange === range ? "bg-cyan-500 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              {range === "hour" ? "Last Hour" : range === "day" ? "Last 24h" : "Last 7d"}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400">Total</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{totalVerifications.toLocaleString()}</div>
        </div>

        <div className="p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400">Success Rate</span>
            <TrendingUp className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-green-400 mt-2">{successRate}%</div>
        </div>

        <div className="p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400">Bot Blocks</span>
            <TrendingDown className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-bold text-red-400 mt-2">{botAttempts}</div>
        </div>
      </div>

      {/* Simplified Chart/Logs View */}
      <div className="relative h-64 bg-zinc-900/30 rounded-lg border border-zinc-800 p-4 overflow-y-auto">
        <h4 className="text-md font-semibold text-white mb-3">Recent Activity</h4>
        <div className="space-y-3">
          {data.recentLogs.map((log, idx) => (
            <motion.div
              key={idx}
              className="flex items-center justify-between text-sm"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="flex items-center gap-3">
                {log.success ? (
                  <TrendingUp className="w-4 h-4 text-green-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-400" />
                )}
                <span className={log.success ? "text-green-400" : "text-red-400"}>
                  Verification {log.success ? "Succeeded" : "Failed"}
                </span>
                {log.bot && <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded">Bot</span>}
              </div>
              <span className="text-zinc-500 text-xs">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
