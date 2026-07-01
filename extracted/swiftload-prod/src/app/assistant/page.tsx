'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

interface ChatMessage { role: 'user' | 'assistant'; content: string }

const STARTERS = [
  'What is the cost per km for a 14-ton truck from Gaborone to Francistown?',
  'How does escrow payment work on SwiftLoad?',
  'What documents does a driver need to register?',
  'Find me the cheapest route from Maun to Kasane',
  'What cargo types need refrigerated trucks?',
  'How do I verify my business on SwiftLoad (CIPA)?',
]

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: "Hi! I'm SwiftAI, your logistics copilot. I can help with pricing estimates, route planning, cargo regulations, carrier selection, and anything else SwiftLoad-related.\n\nWhat can I help you with today?" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async (text?: string) => {
    const content = (text ?? input).trim()
    if (!content || loading) return
    setInput('')
    const newMsgs: ChatMessage[] = [...messages, { role: 'user', content }]
    setMessages(newMsgs)
    setLoading(true)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMsgs }),
      })
      const data = await res.json()
      setMessages([...newMsgs, { role: 'assistant', content: data.content ?? "I'm having trouble right now. Please try again shortly." }])
    } catch {
      setMessages([...newMsgs, { role: 'assistant', content: 'Connection error. Please check your internet and try again.' }])
    }
    setLoading(false)
    textareaRef.current?.focus()
  }

  return (
    <div style={{ height: 'calc(100vh - 56px)', display: 'flex', flexDirection: 'column', background: '#080E1A' }}>
      {/* Header */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,.07)', display: 'flex', alignItems: 'center', gap: 14, background: '#0D1628' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#F59E0B,#F47920)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🤖</div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15 }}>SwiftAI Logistics Copilot</div>
          <div style={{ fontSize: 11, color: '#10B981', display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
            Powered by GPT-4o · Logistics-trained
          </div>
        </div>
        <div style={{ marginLeft: 'auto', fontSize: 11, color: '#64748B' }}>Per §16 Master Guidelines — AI assists, does not replace human judgment in safety matters</div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', gap: 10 }}>
            {m.role === 'assistant' && (
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#F59E0B,#F47920)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0, alignSelf: 'flex-end' }}>🤖</div>
            )}
            <div style={{ maxWidth: '78%', background: m.role === 'user' ? '#F59E0B' : '#0E1825', borderRadius: m.role === 'user' ? '14px 14px 3px 14px' : '14px 14px 14px 3px', padding: '12px 16px', color: m.role === 'user' ? '#080E1A' : '#fff', fontSize: 14, lineHeight: 1.6, border: m.role === 'assistant' ? '1px solid rgba(255,255,255,.07)' : 'none', whiteSpace: 'pre-wrap' }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#F59E0B,#F47920)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🤖</div>
            <div style={{ background: '#0E1825', borderRadius: '14px 14px 14px 3px', padding: '12px 16px', border: '1px solid rgba(255,255,255,.07)' }}>
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                {[0, 1, 2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#F59E0B', opacity: .7, animation: `pulse 1.2s ${i * 0.2}s ease-in-out infinite` }} />)}
              </div>
            </div>
          </div>
        )}

        {/* Starters (only when 1 message) */}
        {messages.length === 1 && (
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>Try asking…</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {STARTERS.map(s => (
                <button key={s} onClick={() => send(s)} style={{ background: 'rgba(245,158,11,.06)', border: '1px solid rgba(245,158,11,.16)', borderRadius: 10, padding: '10px 14px', color: '#94A3B8', fontSize: 13, textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 180ms ease' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = '#F59E0B', e.currentTarget.style.color = '#F59E0B')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(245,158,11,.16)', e.currentTarget.style.color = '#94A3B8')}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '12px 24px 16px', borderTop: '1px solid rgba(255,255,255,.07)', background: '#0D1628', display: 'flex', gap: 10, alignItems: 'flex-end' }}>
        <textarea ref={textareaRef} value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
          placeholder="Ask SwiftAI anything about logistics, pricing, routes, regulations…" className="input-base"
          style={{ flex: 1, resize: 'none', maxHeight: 120, minHeight: 48 }} rows={2} />
        <button onClick={() => send()} disabled={!input.trim() || loading} className="btn btn-amber btn-lg" style={{ height: 48, paddingLeft: 20, paddingRight: 20, flexShrink: 0 }}>
          {loading ? <LoadingSpinner size={18} color="#080E1A" /> : 'Send →'}
        </button>
      </div>
    </div>
  )
}
