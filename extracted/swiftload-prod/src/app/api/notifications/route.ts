import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    const { data: profile } = await supabase.from('profiles').select('id').eq('user_id', session.user.id).single()
    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    const { searchParams } = req.nextUrl
    const unread_only = searchParams.get('unread') === 'true'
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '30'), 50)

    let q = supabase.from('notifications').select('*').eq('user_id', profile.id).order('created_at', { ascending: false }).limit(limit)
    if (unread_only) q = q.is('read_at', null)
    const { data, error } = await q
    if (error) throw error

    const { count } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', profile.id).is('read_at', null)
    return NextResponse.json({ notifications: data ?? [], unread_count: count ?? 0 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    const { data: profile } = await supabase.from('profiles').select('id').eq('user_id', session.user.id).single()
    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    const { notification_id, mark_all } = await req.json()
    const read_at = new Date().toISOString()

    if (mark_all) {
      await supabase.from('notifications').update({ read_at }).eq('user_id', profile.id).is('read_at', null)
    } else if (notification_id) {
      await supabase.from('notifications').update({ read_at }).eq('id', notification_id).eq('user_id', profile.id)
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
