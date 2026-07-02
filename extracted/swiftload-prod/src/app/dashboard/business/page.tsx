import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { BusinessDashboard } from '@/components/features/dashboards/BusinessDashboard'
export default async function BusinessDashboardPage() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth/login')
  const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', session.user.id).single()
  if (!profile || !['business','admin'].includes(profile.role)) redirect('/dashboard')
  const { data: loads } = await supabase.from('loads').select('*').eq('poster_id', profile.id).order('created_at',{ ascending:false }).limit(30)
  const stats = {
    total_loads: loads?.length ?? 0,
    active_loads: loads?.filter((l: { status?: string | null }) => ['posted', 'bidding', 'accepted', 'in_transit'].includes(l.status ?? '')).length ?? 0,
    total_spend: 0,
    avg_cost_per_km: 0,
    preferred_carriers: 0,
    on_time_deliveries: 0,
  }
  return (
    <DashboardLayout role="business" userName={profile.full_name} avatarUrl={profile.avatar_url}>
      <BusinessDashboard profile={profile} stats={stats} loads={loads??[]}/>
    </DashboardLayout>
  )
}
