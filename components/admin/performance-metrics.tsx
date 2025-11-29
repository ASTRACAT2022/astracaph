"use client"

import { Zap, Clock, Database, Globe } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function PerformanceMetrics() {
  const metrics = [
    {
      label: "Avg Response Time",
      value: "145ms",
      change: "-12%",
      icon: Clock,
      positive: true,
    },
    {
      label: "Challenge Load Time",
      value: "89ms",
      change: "-8%",
      icon: Zap,
      positive: true,
    },
    {
      label: "Memory Usage",
      value: "2.4MB",
      change: "+5%",
      icon: Database,
      positive: false,
    },
    {
      label: "API Uptime",
      value: "99.98%",
      change: "+0.02%",
      icon: Globe,
      positive: true,
    },
  ]

  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-cyan-400" />
          <CardTitle className="text-white">Performance Metrics</CardTitle>
        </div>
        <p className="text-sm text-zinc-400 mt-1">System health and speed</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {metrics.map((metric) => {
            const Icon = metric.icon
            return (
              <div
                key={metric.label}
                className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-lg border border-zinc-800"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-500/10 rounded-lg">
                    <Icon className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <div className="text-xs text-zinc-400">{metric.label}</div>
                    <div className="text-lg font-bold text-white mt-0.5">{metric.value}</div>
                  </div>
                </div>
                <div className={`text-sm font-medium ${metric.positive ? "text-green-400" : "text-red-400"}`}>
                  {metric.change}
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-6 p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-lg">
          <div className="flex items-center gap-2 text-cyan-400 text-sm font-medium mb-2">
            <Zap className="w-4 h-4" />
            <span>Optimization Tip</span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Your system is performing excellently. Consider implementing CDN caching for static assets to further reduce
            load times.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
