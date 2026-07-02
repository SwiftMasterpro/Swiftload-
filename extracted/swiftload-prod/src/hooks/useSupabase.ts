import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }: { data: { user: User | null } }) => {
      setUser(data.user)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_: string, session: { user: User | null } | null) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}

export function useProfile(userId: string | null) {
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    supabase.from('profiles').select('*').eq('user_id', userId).single()
      .then(({ data }: { data: Record<string, unknown> | null }) => { setProfile(data); setLoading(false) })
  }, [userId])

  return { profile, loading }
}

export function useLoads(filters?: { status?: string; vehicle_type?: string }) {
  const [loads, setLoads] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const fetch = useCallback(async () => {
    setLoading(true)
    let q = supabase.from('loads').select('*,poster:profiles!poster_id(full_name,rating)').eq('status','posted')
    if (filters?.vehicle_type) q = q.eq('required_vehicle_type', filters.vehicle_type)
    const { data } = await q.order('created_at', { ascending:false }).limit(20)
    setLoads(data ?? [])
    setLoading(false)
  }, [filters?.status, filters?.vehicle_type])

  useEffect(() => { fetch() }, [fetch])
  return { loads, loading, refetch: fetch }
}

export function useRealtime(table: string, filter: string, callback: () => void) {
  const supabase = createClient()
  useEffect(() => {
    const channel = supabase.channel(`realtime-${table}`)
      .on('postgres_changes', { event:'*', schema:'public', table, filter }, callback)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [table, filter])
}
