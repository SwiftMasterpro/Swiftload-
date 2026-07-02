import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { FleetDashboard } from '@/components/features/dashboards/FleetDashboard'
export default async function FleetDashboardPage() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth/login')
  const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', session.user.id).single()
  if (!profile || !['fleet_owner','admin'].includes(profile.role)) redirect('/dashboard')
  const { data: vehicles } = await supabase.from('vehicles').select('*').eq('owner_id', profile.id).order('created_at',{ ascending:false })
  const stats = {
    total_vehicles: vehicles?.length ?? 0,
    active_vehicles: vehicles?.filter((v: { status?: string | null }) => v.status === 'active').length ?? 0,
    maintenance_due: vehicles?.filter((v: { status?: string | null }) => v.status === 'maintenance').length ?? 0,
    total_revenue: 0,
    avg_utilisation: 0,
    drivers_count: 0,
  }
  return (
    <DashboardLayout role="fleet_owner" userName={profile.full_name} avatarUrl={profile.avatar_url}>
      <FleetDashboard profile={profile} stats={stats} vehicles={vehicles??[]}/>
    </DashboardLayout>
  )
}
