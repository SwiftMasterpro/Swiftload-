const MAP: Record<string, { label: string; cls: string }> = {
  draft:       { label: 'Draft',       cls: 'badge-mist' },
  posted:      { label: 'Posted',      cls: 'badge-blue' },
  bidding:     { label: 'Bidding',     cls: 'badge-amber' },
  accepted:    { label: 'Accepted',    cls: 'badge-green' },
  in_transit:  { label: 'In Transit',  cls: 'badge-blue' },
  delivered:   { label: 'Delivered',   cls: 'badge-green' },
  disputed:    { label: 'Disputed',    cls: 'badge-red' },
  cancelled:   { label: 'Cancelled',   cls: 'badge-mist' },
  pending:     { label: 'Pending',     cls: 'badge-amber' },
  confirmed:   { label: 'Confirmed',   cls: 'badge-green' },
  held:        { label: 'Held',        cls: 'badge-blue' },
  released:    { label: 'Released',    cls: 'badge-green' },
  refunded:    { label: 'Refunded',    cls: 'badge-mist' },
  available:   { label: 'Available',   cls: 'badge-green' },
  on_trip:     { label: 'On Trip',     cls: 'badge-blue' },
  maintenance: { label: 'Maintenance', cls: 'badge-amber' },
  inactive:    { label: 'Inactive',    cls: 'badge-mist' },
  open:        { label: 'Open',        cls: 'badge-amber' },
  in_progress: { label: 'In Progress', cls: 'badge-blue' },
  resolved:    { label: 'Resolved',    cls: 'badge-green' },
  closed:      { label: 'Closed',      cls: 'badge-mist' },
}

export function StatusBadge({ status }: { status: string }) {
  const s = MAP[status] ?? { label: status, cls: 'badge-mist' }
  return <span className={`badge ${s.cls}`}>{s.label}</span>
}
