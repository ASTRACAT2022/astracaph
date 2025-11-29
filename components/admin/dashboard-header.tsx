"use client"

import { Shield, Activity } from "lucide-react"
import { motion } from "framer-motion"

export function DashboardHeader() {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="p-2 bg-cyan-500/10 rounded-lg">
              <Shield className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">AstraCaph</h1>
              <p className="text-xs text-zinc-400">Admin Dashboard</p>
            </div>
          </motion.div>

          <motion.div
            className="flex items-center gap-2 text-xs"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 rounded-full">
              <Activity className="w-3 h-3 text-green-400 animate-pulse" />
              <span className="text-green-400 font-medium">Live</span>
            </div>
            <div className="px-3 py-1.5 bg-zinc-800 rounded-full text-zinc-300">v1.0.0</div>
          </motion.div>
        </div>
      </div>
    </header>
  )
}
