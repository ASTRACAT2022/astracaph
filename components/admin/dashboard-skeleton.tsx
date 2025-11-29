export default function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-zinc-900/50 rounded-lg animate-pulse" />
        ))}
      </div>
      <div className="h-96 bg-zinc-900/50 rounded-lg animate-pulse" />
    </div>
  )
}

export { DashboardSkeleton }
