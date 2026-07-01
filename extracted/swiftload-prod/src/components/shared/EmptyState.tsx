import { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: string
  title: string
  body?: string
  action?: ReactNode
}

export function EmptyState({ icon = '📭', title, body, action }: EmptyStateProps) {
  return (
    <div style={{
      textAlign: 'center', padding: '56px 24px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
    }}>
      <div style={{ fontSize: 42 }}>{icon}</div>
      <h3 className="t-h3">{title}</h3>
      {body && (
        <p className="t-body t-small" style={{ maxWidth: 280, textAlign: 'center' }}>{body}</p>
      )}
      {action}
    </div>
  )
}
