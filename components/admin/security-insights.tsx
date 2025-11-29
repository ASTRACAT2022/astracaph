"use client"

import { Shield, AlertTriangle, Ban, Activity } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function SecurityInsights() {
  const threats = [
    { type: "Headless Browser", count: 45, severity: "high", icon: AlertTriangle },
    { type: "Suspicious Timing", count: 23, severity: "medium", icon: Activity },
    { type: "Rate Limit Hit", count: 12, severity: "low", icon: Ban },
    { type: "Replay Attack", count: 8, severity: "high", icon: Shield },
  ]

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "text-red-400 bg-red-500/10"
      case "medium":
        return "text-yellow-400 bg-yellow-500/10"
      case "low":
        return "text-blue-400 bg-blue-500/10"
      default:
        return "text-zinc-400 bg-zinc-500/10"
    }
  }

  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-cyan-400" />
          <CardTitle className="text-white">Security Insights</CardTitle>
        </div>
        <p className="text-sm text-zinc-400 mt-1">Detected threats and patterns</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {threats.map((threat) => {
            const Icon = threat.icon
            return (
              <div
                key={threat.type}
                className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg border border-zinc-800"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getSeverityColor(threat.severity)}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{threat.type}</div>
                    <div className="text-xs text-zinc-500 capitalize">{threat.severity} severity</div>
                  </div>
                </div>
                <div className="text-lg font-bold text-cyan-400">{threat.count}</div>
              </div>
            )
          })}
        </div>

        <div className="mt-6 pt-6 border-t border-zinc-800">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-400">Total Threats Blocked</span>
            <span className="text-xl font-bold text-green-400">88</span>
          </div>
          <div className="mt-2 text-xs text-zinc-500">99.2% protection rate in the last 24 hours</div>
        </div>
      </CardContent>
    </Card>
  )
}
