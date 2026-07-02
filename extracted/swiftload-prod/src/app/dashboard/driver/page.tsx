import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { DriverDashboard } from '@/components/features/dashboards/DriverDashboard'
export default async function DriverDashboardPage() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth/login')
  const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', session.user.id).single()
  if (!profile || !['driver','admin'].includes(profile.role)) redirect('/dashboard')
  const [{ data: availableLoads }, { data: bookings }] = await Promise.all([
    supabase.from('loads').select('*').eq('status','posted').order('created_at',{ ascending:false }).limit(20),
    supabase.from('bookings').select('*,load:loads(*)').eq('driver_id', profile.id).order('created_at',{ ascending:false }).limit(20),
  ])
  const stats = {
    total_trips: bookings?.length ?? 0,
    active_trips: bookings?.filter((b: { status?: string | null }) => b.status === 'in_transit').length ?? 0,
    completed_trips: bookings?.filter((b: { status?: string | null }) => b.status === 'delivered').length ?? 0,
    total_earned: 0,
    on_time_rate: 94,
    avg_rating: profile.rating ?? 0,
    acceptance_rate: 87,
  }
  return (
    <DashboardLayout role="driver" userName={profile.full_name} avatarUrl={profile.avatar_url}>
      <DriverDashboard profile={profile} stats={stats} availableLoads={availableLoads??[]} bookings={bookings??[]}/>
    </DashboardLayout>
  )
}
