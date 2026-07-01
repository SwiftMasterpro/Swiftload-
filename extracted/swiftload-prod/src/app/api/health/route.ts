import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export const runtime = 'edge'

export async function GET() {
  const start = Date.now()
  let db = 'ok'
  try {
    const supabase = createAdminClient()
    await supabase.from('profiles').select('id', { count: 'exact', head: true })
  } catch {
    db = 'error'
  }
  return NextResponse.json({
    status:  db === 'ok' ? 'healthy' : 'degraded',
    app:     'Pronto SwiftLoad',
    version: '2.0.0',
    db,
    latency: `${Date.now() - start}ms`,
    ts:      new Date().toISOString(),
    region:  process.env.VERCEL_REGION ?? 'local',
  })
}
