import { Suspense } from "react"
import { DashboardContent } from "@/components/admin/dashboard-content"
import { DashboardHeader } from "@/components/admin/dashboard-header"
import { DashboardSkeleton } from "@/components/admin/dashboard-skeleton"

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-black">
      <DashboardHeader />
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  )
}
