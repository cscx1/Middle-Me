import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { SessionCard } from '@/components/features/sessions/SessionCard'
import { TrendingTopics } from '@/components/features/trending/TrendingTopics'
import type { Session, TrendingTopic } from '@/types'

export const metadata = { title: 'Dashboard — Middle Me' }

const SUGGESTED_TOPICS = [
  { label: 'Remote work expectations', emoji: '💼' },
  { label: 'Healthcare access', emoji: '🌿' },
  { label: 'Religion in the family', emoji: '🕊️' },
  { label: 'Political polarization', emoji: '🗳️' },
  { label: 'Relationship boundaries', emoji: '💛' },
]

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [sessionsResult, trendingResult] = await Promise.all([
    supabase
      .from('sessions')
      .select('*')
      .eq('created_by', user!.id)
      .eq('business_mode', false)
      .is('deleted_at', null)
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

      {/* Hero card — Meet in the Middle */}
      <section>
        <div className="bg-gradient-to-br from-positive-blue/10 to-positive-green/5 border border-positive-blue/15 rounded-2xl px-8 py-8">
          <div className="max-w-xl">
            <p className="text-xs font-semibold text-positive-blue uppercase tracking-widest mb-3">
              AI-Guided Mediation
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-800 mb-3 leading-snug">
              Meet in the Middle
            </h1>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              Share both perspectives and let AI find the common ground. Middle Me sees both sides,
              de-escalates tension, and guides you toward a resolution that preserves the relationship.
            </p>
            <Link
              href="/sessions/new"
              className="inline-flex items-center gap-2 bg-positive-blue hover:bg-positive-blue/90 text-white rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-positive-blue/40 focus-visible:ring-offset-2"
            >
              Start a Mediation
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Suggested Topics */}
      <section>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
          Suggested Topics
        </h2>
        <div className="flex flex-wrap gap-2.5">
          {SUGGESTED_TOPICS.map(({ label, emoji }) => (
            <Link
              key={label}
              href={`/sessions/new?topic=${encodeURIComponent(label)}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-background text-sm text-foreground hover:border-positive-blue/40 hover:bg-positive-blue/5 hover:text-positive-blue transition-colors"
            >
              <span>{emoji}</span>
              {label}
            </Link>
          ))}
        </div>
      </section>

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
              No sessions yet — click a suggested topic above or start a custom mediation.
            </p>
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
