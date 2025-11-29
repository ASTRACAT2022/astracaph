"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { TrendingUp, TrendingDown } from "lucide-react"

interface ChartData {
  timestamp: number
  verifications: number
  success: number
  failed: number
  bots: number
}

export function AnalyticsChart() {
  const [data, setData] = useState<ChartData[]>([])
  const [timeRange, setTimeRange] = useState<"hour" | "day" | "week">("hour")

  useEffect(() => {
    // Generate mock data for visualization
    // In production, this would fetch real time-series data
    const generateMockData = () => {
      const points = timeRange === "hour" ? 12 : timeRange === "day" ? 24 : 7
      const newData: ChartData[] = []

      for (let i = 0; i < points; i++) {
        const verifications = Math.floor(Math.random() * 100) + 20
        const success = Math.floor(verifications * (0.7 + Math.random() * 0.2))
        const failed = verifications - success
        const bots = Math.floor(Math.random() * 30)

        newData.push({
          timestamp:
            Date.now() -
            (points - i) *
              (timeRange === "hour" ? 5 * 60 * 1000 : timeRange === "day" ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000),
          verifications,
          success,
          failed,
          bots,
        })
      }

      setData(newData)
    }

    generateMockData()
    const interval = setInterval(generateMockData, 10000)
    return () => clearInterval(interval)
  }, [timeRange])

  const maxValue = Math.max(...data.map((d) => d.verifications), 1)
  const totalVerifications = data.reduce((sum, d) => sum + d.verifications, 0)
  const avgSuccess =
    data.length > 0
      ? (
          (data.reduce((sum, d) => sum + d.success, 0) / data.reduce((sum, d) => sum + d.verifications, 0)) *
          100
        ).toFixed(1)
      : "0"

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
          <div className="text-2xl font-bold text-green-400 mt-2">{avgSuccess}%</div>
        </div>

        <div className="p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400">Bot Blocks</span>
            <TrendingDown className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-bold text-red-400 mt-2">{data.reduce((sum, d) => sum + d.bots, 0)}</div>
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-64 bg-zinc-900/30 rounded-lg border border-zinc-800 p-4">
        <div className="absolute inset-0 p-4">
          <div className="relative w-full h-full flex items-end gap-1 pb-6">
            {data.map((point, idx) => {
              const height = (point.verifications / maxValue) * 100
              const successHeight = (point.success / point.verifications) * height

              return (
                <motion.div
                  key={idx}
                  className="flex-1 flex flex-col justify-end gap-0.5 group cursor-pointer"
                  initial={{ height: 0 }}
                  animate={{ height: "100%" }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <div className="relative flex flex-col justify-end h-full">
                    {/* Success portion */}
                    <motion.div
                      className="w-full bg-gradient-to-t from-green-500/80 to-green-400/80 rounded-t"
                      style={{ height: `${successHeight}%` }}
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ delay: idx * 0.05 + 0.2 }}
                    />
                    {/* Failed portion */}
                    <motion.div
                      className="w-full bg-gradient-to-t from-red-500/80 to-red-400/80 rounded-b"
                      style={{ height: `${height - successHeight}%` }}
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ delay: idx * 0.05 + 0.2 }}
                    />

                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-xs whitespace-nowrap shadow-xl">
                        <div className="text-zinc-400 mb-1">{new Date(point.timestamp).toLocaleTimeString()}</div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full" />
                            <span className="text-green-400">Success: {point.success}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-400 rounded-full" />
                            <span className="text-red-400">Failed: {point.failed}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                            <span className="text-yellow-400">Bots: {point.bots}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* X-axis labels */}
          <div className="absolute bottom-0 left-4 right-4 flex justify-between text-xs text-zinc-500">
            <span>
              {new Date(data[0]?.timestamp || Date.now()).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <span>Now</span>
          </div>
        </div>

        {/* Legend */}
        <div className="absolute top-4 right-4 flex gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-green-400 rounded" />
            <span className="text-zinc-400">Success</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-red-400 rounded" />
            <span className="text-zinc-400">Failed</span>
          </div>
        </div>
      </div>
    </div>
  )
}
