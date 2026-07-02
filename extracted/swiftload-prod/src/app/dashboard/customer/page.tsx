import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { CustomerDashboard } from '@/components/features/dashboards/CustomerDashboard'
export default async function CustomerDashboardPage() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth/login')
  const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', session.user.id).single()
  if (!profile || profile.role !== 'customer') redirect('/dashboard')
  const [{ data: loads }, { data: bookings }] = await Promise.all([
    supabase.from('loads').select('*').eq('poster_id', profile.id).order('created_at', { ascending:false }).limit(20),
    supabase.from('bookings').select('*,load:loads(*),driver:profiles(*)').eq('customer_id', profile.id).order('created_at', { ascending:false }).limit(10),
  ])
  const stats = {
    total_loads: loads?.length ?? 0,
    active_loads: loads?.filter((l: { status?: string | null }) => ['posted', 'bidding', 'accepted', 'in_transit'].includes(l.status ?? '')).length ?? 0,
    completed_loads: loads?.filter((l: { status?: string | null }) => l.status === 'delivered').length ?? 0,
    total_spent: 0,
    avg_rating_given: 0,
  }
  return (
    <DashboardLayout role="customer" userName={profile.full_name} avatarUrl={profile.avatar_url}>
      <CustomerDashboard profile={profile} stats={stats} loads={loads??[]} bookings={bookings??[]}/>
    </DashboardLayout>
  )
}
