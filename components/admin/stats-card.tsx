"use client"

import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  iconColor?: string
  valueColor?: string
  delay?: number
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  iconColor = "text-zinc-400",
  valueColor = "text-white",
  delay = 0,
}: StatsCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-zinc-400">{title}</CardTitle>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${valueColor}`}>{value}</div>
          {description && <p className="text-xs text-zinc-500 mt-1">{description}</p>}
        </CardContent>
      </Card>
    </motion.div>
  )
}
