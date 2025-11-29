import { Suspense } from "react"
import { DashboardHeader } from "@/components/admin/dashboard-header"
import { AnalyticsContent } from "@/components/admin/analytics-content"

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-black">
      <DashboardHeader />
      <Suspense fallback={<div className="p-8 text-zinc-400">Loading analytics...</div>}>
        <AnalyticsContent />
      </Suspense>
    </div>
  )
}
