import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { SessionCard } from '@/components/features/sessions/SessionCard'
import type { Session } from '@/types'

export const metadata = { title: 'Sessions — Middle Me' }

export default async function SessionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data } = await supabase
    .from('sessions')
    .select('*')
    .eq('created_by', user!.id)
    .order('created_at', { ascending: false })

  const sessions = (data ?? []) as Session[]

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Sessions</h1>
        <Link
          href="/sessions/new"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New session
        </Link>
      </div>

      {sessions.length === 0 ? (
        <div className="border border-dashed rounded-xl p-16 text-center">
          <p className="text-muted-foreground text-sm mb-4">
            No sessions yet. Start your first mediation.
          </p>
          <Link
            href="/sessions/new"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Start session
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessions.map((s) => (
            <SessionCard key={s.id} session={s} />
          ))}
        </div>
      )}
    </div>
  )
}
