import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/shared/Sidebar'

// Avoid prerendering at build time so Supabase env is only needed at runtime
export const dynamic = 'force-dynamic'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('NEXT_REDIRECT')) throw err
    redirect('/login?error=config')
  }
}
