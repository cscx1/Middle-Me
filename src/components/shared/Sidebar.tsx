'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, MessageSquare, Plus, LogOut, Briefcase } from 'lucide-react'
import { cn } from '@/lib/utils'
import { signOut } from '@/actions/auth'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/sessions', label: 'Sessions', icon: MessageSquare },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 shrink-0 border-r bg-sidebar flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b">
        <Link href="/dashboard" className="font-semibold tracking-tight text-sidebar-foreground">
          Middle Me
        </Link>
      </div>

      {/* New session CTA */}
      <div className="px-3 pt-4">
        <Link
          href="/sessions/new"
          className="flex items-center gap-2 w-full bg-positive-blue hover:bg-positive-blue/90 text-white rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-positive-blue/40 focus-visible:ring-offset-2"
        >
          <Plus className="w-4 h-4" />
          New Session
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pt-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href + '/'))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-positive-blue/10 text-positive-blue font-medium border-l-2 border-positive-blue pl-[10px]'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          )
        })}

        {/* Workplace Harmony AI nav link */}
        <Link
          href="/business"
          className={cn(
            'flex items-start gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
            pathname.startsWith('/business')
              ? 'bg-positive-blue/10 text-positive-blue border border-positive-blue/20 font-medium'
              : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
          )}
        >
          <Briefcase
            className={cn(
              'w-4 h-4 shrink-0 mt-0.5',
              pathname.startsWith('/business') ? 'text-positive-blue' : ''
            )}
          />
          <div className="min-w-0">
            <div className="font-medium leading-tight">Workplace Harmony AI</div>
            <div
              className={cn(
                'text-xs mt-0.5 font-normal',
                pathname.startsWith('/business') ? 'text-positive-blue/70' : 'text-muted-foreground'
              )}
            >
              Enterprise mediation
            </div>
          </div>
        </Link>
      </nav>

      {/* Sign out */}
      <div className="px-3 pb-4 border-t pt-3">
        <form action={signOut}>
          <button
            type="submit"
            className="flex items-center gap-3 w-full rounded-lg px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  )
}
