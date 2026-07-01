import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
export default async function DashboardPage() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth/login')
  const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', session.user.id).single()
  const role = profile?.role ?? 'customer'
  const routes: Record<string,string> = { customer:'/dashboard/customer', driver:'/dashboard/driver', business:'/dashboard/business', fleet_owner:'/dashboard/fleet', admin:'/dashboard/admin', support:'/dashboard/admin' }
  redirect(routes[role] ?? '/dashboard/customer')
}
