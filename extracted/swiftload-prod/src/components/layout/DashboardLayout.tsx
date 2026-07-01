'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Logo } from '@/components/ui/Logo'
import { createClient } from '@/lib/supabase/client'
import type { UserRole } from '@/types'

/* Navigation per Master Guidelines Manual §7 */
const NAV_BY_ROLE: Record<UserRole, { href: string; label: string; icon: string }[]> = {
  customer: [
    { href: '/dashboard/customer',  label: 'Overview',   icon: '🏠' },
    { href: '/marketplace/post',    label: 'Book',       icon: '📦' },
    { href: '/tracking',            label: 'Track',      icon: '📍' },
    { href: '/marketplace',         label: 'Marketplace',icon: '🏪' },
    { href: '/messages',            label: 'Messages',   icon: '💬' },
    { href: '/assistant',           label: 'AI Copilot', icon: '🤖' },
  ],
  driver: [
    { href: '/dashboard/driver',    label: 'Jobs',       icon: '🚛' },
    { href: '/marketplace',         label: 'Find Loads', icon: '🏪' },
    { href: '/road-intelligence',   label: 'Road Intel', icon: '🛣️' },
    { href: '/tracking',            label: 'Map & GPS',  icon: '📍' },
    { href: '/messages',            label: 'Messages',   icon: '💬' },
    { href: '/assistant',           label: 'AI Copilot', icon: '🤖' },
  ],
  business: [
    { href: '/dashboard/business',  label: 'Dashboard',  icon: '🏢' },
    { href: '/marketplace/post',    label: 'Post Load',  icon: '📦' },
    { href: '/marketplace',         label: 'Orders',     icon: '📋' },
    { href: '/fleet',               label: 'Fleet',      icon: '🚛' },
    { href: '/messages',            label: 'Messages',   icon: '💬' },
    { href: '/assistant',           label: 'Analytics',  icon: '📊' },
  ],
  fleet_owner: [
    { href: '/dashboard/fleet',     label: 'Fleet',      icon: '🚛' },
    { href: '/marketplace',         label: 'Find Loads', icon: '🏪' },
    { href: '/tracking',            label: 'Live Map',   icon: '📍' },
    { href: '/road-intelligence',   label: 'Road Intel', icon: '🛣️' },
    { href: '/messages',            label: 'Messages',   icon: '💬' },
    { href: '/assistant',           label: 'Analytics',  icon: '📊' },
  ],
  admin: [
    { href: '/dashboard/admin',     label: 'Overview',   icon: '🎛️' },
    { href: '/dashboard/admin',     label: 'Users',      icon: '👥' },
    { href: '/dashboard/admin',     label: 'Payments',   icon: '💳' },
    { href: '/dashboard/admin',     label: 'Disputes',   icon: '⚖️' },
    { href: '/dashboard/admin',     label: 'Tickets',    icon: '🎫' },
    { href: '/assistant',           label: 'AI Tools',   icon: '🤖' },
  ],
  support: [
    { href: '/dashboard/admin',     label: 'Tickets',    icon: '🎫' },
    { href: '/messages',            label: 'Messages',   icon: '💬' },
  ],
}

interface Props {
  children: React.ReactNode
  role: UserRole
  userName: string
  avatarUrl?: string
}

export function DashboardLayout({ children, role, userName, avatarUrl }: Props) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const nav = NAV_BY_ROLE[role] ?? NAV_BY_ROLE.customer

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#080E1A' }}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 90 }} />
      )}

      {/* Sidebar */}
      <aside style={{
        width: 220, background: '#0D1628', borderRight: '1px solid rgba(255,255,255,.06)',
        display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100,
        transform: mobileOpen ? 'translateX(0)' : undefined,
        transition: 'transform 260ms cubic-bezier(0.22,1,0.36,1)',
      }}>
        {/* Logo */}
        <div style={{ padding: '16px 14px 12px', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
          <Logo size={28} />
        </div>

        {/* Role badge */}
        <div style={{ padding: '10px 14px 6px' }}>
          <span className="badge badge-amber" style={{ textTransform: 'capitalize', fontSize: 9 }}>{role.replace('_', ' ')}</span>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '6px 10px', overflowY: 'auto' }}>
          {nav.map(item => {
            const isActive = pathname === item.href
            return (
              <Link key={`${item.href}-${item.label}`} href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`sidebar-link${isActive ? ' active' : ''}`}>
                <span style={{ fontSize: 15 }}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* User profile section */}
        <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(255,255,255,.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 12, fontWeight: 800, color: '#080E1A' }}>
              {avatarUrl ? <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName}</div>
              <div style={{ fontSize: 10, color: '#64748B', textTransform: 'capitalize' }}>{role.replace('_', ' ')}</div>
            </div>
          </div>
          <button onClick={handleSignOut} className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center', color: '#64748B', fontSize: 11 }}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, marginLeft: 220, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Top bar */}
        <header style={{ height: 56, borderBottom: '1px solid rgba(255,255,255,.06)', background: 'rgba(8,14,26,.96)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', position: 'sticky', top: 0, zIndex: 50 }}>
          <button onClick={() => setMobileOpen(o => !o)} style={{ display: 'none', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 4 }}>
            ☰
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 12, color: '#64748B' }}>
              {new Date().toLocaleDateString('en-BW', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link href="/notifications" style={{ position: 'relative', color: '#64748B', display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
              <span style={{ fontSize: 18 }}>🔔</span>
            </Link>
            <Link href="/messages" style={{ color: '#64748B', display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
              <span style={{ fontSize: 18 }}>💬</span>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  )
}
