"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { AnalyticsChart } from "./analytics-chart"
import { SecurityInsights } from "./security-insights"
import { PerformanceMetrics } from "./performance-metrics"

export function AnalyticsContent() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white mb-2">Analytics</h1>
        <p className="text-zinc-400">Deep insights into your CAPTCHA performance</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="bg-zinc-900/50 border-zinc-800 p-6">
          <AnalyticsChart />
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <SecurityInsights />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <PerformanceMetrics />
        </motion.div>
      </div>
    </div>
  )
}
