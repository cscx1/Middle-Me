import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { SessionCard } from '@/components/features/sessions/SessionCard'
import { TrendingTopics } from '@/components/features/trending/TrendingTopics'
import type { Session, TrendingTopic } from '@/types'

export const metadata = { title: 'Dashboard — Middle Me' }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [sessionsResult, trendingResult] = await Promise.all([
    supabase
      .from('sessions')
      .select('*')
      .eq('created_by', user!.id)
      .order('created_at', { ascending: false })
      .limit(6),
    supabase
      .from('trending_topics')
      .select('*'),
  ])

  const sessions = (sessionsResult.data ?? []) as Session[]
  const trending = (trendingResult.data ?? []) as TrendingTopic[]

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <Link
          href="/sessions/new"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New session
        </Link>
      </div>

      {/* Trending topics */}
      <section>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
          Trending Topics
        </h2>
        <TrendingTopics initial={trending} />
      </section>

      {/* Recent sessions */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Recent Sessions
          </h2>
          {sessions.length > 0 && (
            <Link
              href="/sessions"
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4"
            >
              View all
            </Link>
          )}
        </div>

        {sessions.length === 0 ? (
          <div className="border border-dashed rounded-xl p-10 text-center">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sessions.map((s) => (
              <SessionCard key={s.id} session={s} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
