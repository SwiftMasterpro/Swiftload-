'use client'

import { useEffect, useState } from 'react'

type ContactFormProps = {
  defaultMessage?: string
}

export function ContactForm({ defaultMessage = '' }: ContactFormProps) {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [statusMessage, setStatusMessage] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState(defaultMessage)

  useEffect(() => {
    setMessage(defaultMessage)
  }, [defaultMessage])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('submitting')
    setStatusMessage('Sending your request…')

    const payload = {
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error ?? 'Unable to send your message right now.')
      }

      setStatus('success')
      setStatusMessage('Thanks for getting in touch. We have received your message.')
      setName('')
      setEmail('')
      setMessage(defaultMessage)
    } catch (error) {
      setStatus('error')
      setStatusMessage(error instanceof Error ? error.message : 'Unable to send your message right now.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-white/10 bg-slate-950/60 p-6 shadow-xl shadow-black/20">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm text-slate-300">
          <span className="mb-2 block font-medium">Name</span>
          <input name="name" required value={name} onChange={(event) => setName(event.target.value)} className="input-base" placeholder="Your name" />
        </label>
        <label className="block text-sm text-slate-300">
          <span className="mb-2 block font-medium">Email</span>
          <input name="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="input-base" placeholder="you@example.com" />
        </label>
      </div>
      <label className="block text-sm text-slate-300">
        <span className="mb-2 block font-medium">Message</span>
        <textarea
          name="message"
          required
          rows={5}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className="input-base min-h-[140px] resize-none"
          placeholder="Tell us what you need help moving or coordinating."
        />
      </label>
      <button type="submit" className="btn btn-amber btn-md transition-all duration-200" disabled={status === 'submitting'}>
        {status === 'submitting' ? 'Sending…' : 'Send message'}
      </button>
      {statusMessage ? (
        <p aria-live="polite" className={`text-sm ${status === 'error' ? 'text-red-300' : 'text-emerald-300'}`}>
          {statusMessage}
        </p>
      ) : null}
    </form>
  )
}
