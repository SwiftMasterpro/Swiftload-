import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { AdminDashboard } from '@/components/features/dashboards/AdminDashboard'
export default async function AdminDashboardPage() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth/login')
  const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', session.user.id).single()
  if (!profile || !['admin','support'].includes(profile.role)) redirect('/dashboard')
  const [{ count: userCount }, { count: loadCount }] = await Promise.all([
    supabase.from('profiles').select('*',{ count:'exact', head:true }),
    supabase.from('loads').select('*',{ count:'exact', head:true }),
  ])
  const stats = {
    total_users:userCount??0, active_users_today:0, total_loads:loadCount??0, active_loads:0,
    total_transactions:0, revenue_today:0, open_tickets:0, pending_verifications:3,
  }
  return (
    <DashboardLayout role="admin" userName={profile.full_name} avatarUrl={profile.avatar_url}>
      <AdminDashboard stats={stats}/>
    </DashboardLayout>
  )
}
