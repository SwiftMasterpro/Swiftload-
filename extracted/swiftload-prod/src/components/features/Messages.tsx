'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Message, Conversation, Profile } from '@/types'
import { fmtAgo, fmtDateTime, initials } from '@/lib/utils/format'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { toast } from 'sonner'

export function Messages() {
  const supabase = createClient()
  const [session, setSession] = useState<any>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { session: s } } = await supabase.auth.getSession()
      setSession(s)
      if (!s) { setLoading(false); return }
      const { data: convs } = await supabase.from('conversations').select('*').contains('participants', [s.user.id]).order('last_message_at', { ascending: false })
      setConversations(convs ?? [])
      setLoading(false)
    }
    init()
  }, [])

  useEffect(() => {
    if (!selected || !session) return
    const load = async () => {
      const { data } = await supabase.from('messages').select('*,sender:profiles(full_name,avatar_url)').eq('conversation_id', selected).order('created_at', { ascending: true }).limit(100)
      setMessages(data ?? [])
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
      // Mark as read
      await supabase.from('messages').update({ read_at: new Date().toISOString() }).eq('conversation_id', selected).neq('sender_id', session.user.id).is('read_at', null)
    }
    load()
    const channel = supabase.channel(`msgs:${selected}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${selected}` },
        (payload: { new: Message }) => { setMessages(m => [...m, payload.new as Message]); setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 30) })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [selected, session])

  const sendMessage = async () => {
    if (!text.trim() || !selected || !session || sending) return
    setSending(true)
    const { error } = await supabase.from('messages').insert({
      conversation_id: selected, sender_id: session.user.id, content: text.trim(), type: 'text',
    })
    if (error) { toast.error(error.message); setSending(false); return }
    await supabase.from('conversations').update({ last_message: text.trim(), last_message_at: new Date().toISOString() }).eq('id', selected)
    setText(''); setSending(false)
    textareaRef.current?.focus()
  }

  if (!session && !loading) {
    return (
      <div style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
        <h2 style={{ fontWeight: 700, fontSize: 20, marginBottom: 10 }}>Sign in to view messages</h2>
        <p style={{ color: '#64748B', fontSize: 13, marginBottom: 20 }}>Encrypted messaging between shippers and drivers.</p>
        <a href="/auth/login" className="btn btn-amber btn-md">Sign In</a>
      </div>
    )
  }

  return (
    <div style={{ height: 'calc(100vh - 56px)', display: 'flex', overflow: 'hidden' }}>
      {/* Conversation list */}
      <div style={{ width: 280, borderRight: '1px solid rgba(255,255,255,.07)', display: 'flex', flexDirection: 'column', flexShrink: 0, background: '#0D1628' }}>
        <div style={{ padding: '16px 16px 10px', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
          <div className="t-eyebrow" style={{ marginBottom: 2 }}>Messages</div>
          <div className="t-small" style={{ color: '#64748B' }}>End-to-end encrypted</div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}><LoadingSpinner /></div>
          ) : conversations.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: '#64748B' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>💬</div>
              <div style={{ fontSize: 13 }}>No conversations yet</div>
              <div className="t-small" style={{ marginTop: 4 }}>Messages appear when you book or receive bids</div>
            </div>
          ) : (
            conversations.map(c => (
              <button key={c.id} onClick={() => setSelected(c.id)}
                style={{ width: '100%', background: selected === c.id ? 'rgba(245,158,11,.07)' : 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,.04)', padding: '13px 16px', textAlign: 'left', cursor: 'pointer', borderLeft: selected === c.id ? '2px solid #F59E0B' : '2px solid transparent', transition: 'all 180ms', fontFamily: 'inherit' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#080E1A', flexShrink: 0 }}>
                    💬
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: '#fff', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      Conversation {c.id.slice(-8)}
                    </div>
                    {c.last_message && (
                      <div style={{ fontSize: 11.5, color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.last_message}</div>
                    )}
                    {c.last_message_at && (
                      <div style={{ fontSize: 10, color: '#64748B', marginTop: 2 }}>{fmtAgo(c.last_message_at)}</div>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat window */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {!selected ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: '#64748B' }}>
            <div style={{ fontSize: 52 }}>💬</div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Select a conversation</div>
            <p style={{ fontSize: 13, textAlign: 'center', maxWidth: 280 }}>All messages are end-to-end encrypted between drivers and shippers</p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,.07)', display: 'flex', alignItems: 'center', gap: 12, background: '#0D1628' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>Booking Conversation</div>
                <div style={{ fontSize: 11, color: '#64748B' }}>🔒 Encrypted · {messages.length} messages</div>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {messages.length === 0 && (
                <div style={{ textAlign: 'center', color: '#64748B', padding: '32px 0', fontSize: 13 }}>
                  No messages yet — start the conversation below
                </div>
              )}
              {messages.map(m => {
                const isMe = m.sender_id === session?.user?.id
                return (
                  <div key={m.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', gap: 8 }}>
                    {!isMe && (
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#F59E0B22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#F59E0B', flexShrink: 0, alignSelf: 'flex-end' }}>
                        {initials((m.sender as any)?.full_name ?? '?')}
                      </div>
                    )}
                    <div style={{ maxWidth: '72%' }}>
                      <div style={{ background: isMe ? '#F59E0B' : '#0E1825', borderRadius: isMe ? '14px 14px 3px 14px' : '14px 14px 14px 3px', padding: '10px 14px', color: isMe ? '#080E1A' : '#fff', fontSize: 13.5, lineHeight: 1.5, border: isMe ? 'none' : '1px solid rgba(255,255,255,.07)' }}>
                        {m.content}
                      </div>
                      <div style={{ fontSize: 10, color: '#64748B', marginTop: 3, textAlign: isMe ? 'right' : 'left' }}>
                        {fmtDateTime(m.created_at)}{m.read_at && isMe ? ' · Read' : ''}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>

            {/* Message input */}
            <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,.07)', background: '#0D1628', display: 'flex', gap: 10, alignItems: 'flex-end' }}>
              <textarea ref={textareaRef} value={text} onChange={e => setText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                placeholder="Type a message… (Enter to send, Shift+Enter for newline)" className="input-base"
                style={{ flex: 1, resize: 'none', maxHeight: 120, minHeight: 42 }} rows={1} />
              <button onClick={sendMessage} disabled={!text.trim() || sending} className="btn btn-amber btn-md" style={{ flexShrink: 0, height: 42, paddingLeft: 16, paddingRight: 16 }}>
                {sending ? <LoadingSpinner size={16} color="#080E1A" /> : '→'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
