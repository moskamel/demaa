interface SkeletonProps {
  width?: string | number
  height?: string | number
  radius?: number
  style?: React.CSSProperties
}

export function Skeleton({ width = '100%', height = 16, radius = 6, style }: SkeletonProps) {
  return (
    <div className="skeleton" style={{ width, height, borderRadius: radius, ...style }} />
  )
}

export function SkeletonCard({ rows = 3 }: { rows?: number }) {
  return (
    <div style={{ background: 'var(--canvas-soft)', borderRadius: 14, border: '1px solid var(--hairline)', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <Skeleton width={34} height={34} radius={10} />
        <div style={{ flex: 1 }}>
          <Skeleton width="60%" height={14} style={{ marginBottom: 6 }} />
          <Skeleton width="40%" height={10} />
        </div>
      </div>
      {Array.from({ length: rows - 1 }).map((_, i) => (
        <Skeleton key={i} width={`${70 - i * 15}%`} height={12} />
      ))}
    </div>
  )
}

export function SkeletonRow() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderBottom: '1px solid var(--hairline)' }}>
      <Skeleton width={36} height={36} radius={10} />
      <div style={{ flex: 1 }}>
        <Skeleton width="55%" height={13} style={{ marginBottom: 6 }} />
        <Skeleton width="35%" height={10} />
      </div>
      <Skeleton width={60} height={20} radius={8} />
    </div>
  )
}

export function SkeletonKPI() {
  return (
    <div style={{ background: 'var(--canvas-soft)', borderRadius: 14, border: '1px solid var(--hairline)', padding: '16px 18px' }}>
      <Skeleton width={34} height={34} radius={9} style={{ marginBottom: 12 }} />
      <Skeleton width="50%" height={22} style={{ marginBottom: 6 }} />
      <Skeleton width="70%" height={11} />
    </div>
  )
}
