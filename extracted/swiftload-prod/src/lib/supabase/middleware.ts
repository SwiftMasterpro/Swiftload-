import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse, type NextRequest } from 'next/server'
export async function updateSession(req: NextRequest) {
  const res = NextResponse.next({ request: { headers: req.headers } })
  const supabase = createMiddlewareClient({ req, res })
  await supabase.auth.getSession()
  return res
}
