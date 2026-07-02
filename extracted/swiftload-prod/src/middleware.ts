import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_ROUTES  = ['/dashboard', '/marketplace/post', '/messages', '/assistant', '/fleet', '/notifications']
const AUTH_ROUTES       = ['/auth/login', '/auth/register', '/auth/reset-password']
const ROLE_ROUTES: Record<string, string[]> = {
  '/dashboard/customer': ['customer', 'admin'],
  '/dashboard/driver':   ['driver', 'admin'],
  '/dashboard/business': ['business', 'admin'],
  '/dashboard/fleet':    ['fleet_owner', 'admin'],
  '/dashboard/admin':    ['admin', 'support'],
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next({ request: { headers: req.headers } })
  const path = req.nextUrl.pathname
  const hasSupabaseConfig = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  if (!hasSupabaseConfig) {
    return res
  }

  try {
    const supabase = createMiddlewareClient({ req, res })
    const { data: { session } } = await supabase.auth.getSession()

    if (session && AUTH_ROUTES.some(r => path.startsWith(r))) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    if (!session && PROTECTED_ROUTES.some(r => path.startsWith(r))) {
      const loginUrl = new URL('/auth/login', req.url)
      loginUrl.searchParams.set('next', path)
      return NextResponse.redirect(loginUrl)
    }

    if (session && ROLE_ROUTES[path]) {
      try {
        const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', session.user.id).single()
        if (profile && !ROLE_ROUTES[path].includes(profile.role)) {
          return NextResponse.redirect(new URL('/dashboard', req.url))
        }
      } catch {
        // Ignore profile lookup failures and allow the request to continue.
      }
    }
  } catch {
    // Gracefully continue when Supabase auth is unavailable.
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json|icons|api/health).*)'],
}
