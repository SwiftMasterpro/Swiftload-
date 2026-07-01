export function LoadingSpinner({ size = 20, color = '#F59E0B' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="animate-spin">
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" strokeOpacity=".2" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <LoadingSpinner size={40} />
      <p className="t-small" style={{ color: '#64748B' }}>Loading…</p>
    </div>
  )
}

export function SkeletonCard({ h = 120 }: { h?: number }) {
  return <div className="skeleton" style={{ height: h, borderRadius: 12, width: '100%' }} />
}
