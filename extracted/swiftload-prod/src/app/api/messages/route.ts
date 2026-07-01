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
    const conversation_id = searchParams.get('conversation_id')

    if (conversation_id) {
      const { data: conv } = await supabase.from('conversations').select('participants').eq('id', conversation_id).single()
      if (!conv?.participants?.includes(profile.id))
        return NextResponse.json({ error: 'Not a participant' }, { status: 403 })

      const { data: messages } = await supabase.from('messages')
        .select('*,sender:profiles!sender_id(full_name,avatar_url)')
        .eq('conversation_id', conversation_id)
        .order('created_at', { ascending: true })
        .limit(100)

      await supabase.from('messages').update({ read_at: new Date().toISOString() })
        .eq('conversation_id', conversation_id).neq('sender_id', profile.id).is('read_at', null)

      return NextResponse.json({ messages: messages ?? [] })
    }

    const { data: conversations } = await supabase.from('conversations')
      .select('*')
      .contains('participants', [profile.id])
      .order('last_message_at', { ascending: false })

    return NextResponse.json({ conversations: conversations ?? [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    const { data: profile } = await supabase.from('profiles').select('id').eq('user_id', session.user.id).single()
    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    const { conversation_id, recipient_id, content, type = 'text' } = await req.json()
    if (!content?.trim()) return NextResponse.json({ error: 'Message content required' }, { status: 400 })

    let convId = conversation_id
    if (!convId && recipient_id) {
      const participants = [profile.id, recipient_id].sort()
      const { data: existing } = await supabase.from('conversations')
        .select('id').contains('participants', participants).single()
      if (existing) {
        convId = existing.id
      } else {
        const { data: newConv } = await supabase.from('conversations').insert({
          participants, last_message: content.slice(0, 100), last_message_at: new Date().toISOString(),
        }).select('id').single()
        convId = newConv?.id
      }
    }
    if (!convId) return NextResponse.json({ error: 'conversation_id or recipient_id required' }, { status: 400 })

    const { data: message, error } = await supabase.from('messages').insert({
      conversation_id: convId, sender_id: profile.id, content: content.trim(), type,
    }).select().single()
    if (error) throw error

    await supabase.from('conversations').update({
      last_message: content.slice(0, 100), last_message_at: new Date().toISOString(),
    }).eq('id', convId)

    return NextResponse.json({ message }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
