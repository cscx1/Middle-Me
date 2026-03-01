'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowRight, Briefcase, Upload, BarChart3, Users, TrendingUp,
  FileText, Clock, MessageSquare, MoreVertical, Trash2, CheckCircle2,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn, formatDate } from '@/lib/utils'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import type { Session, SessionCategory } from '@/types'

interface Props {
  sessions: Session[]
}

const CATEGORY_LABELS: Record<SessionCategory | string, string> = {
  relationships: 'Relationships',
  family: 'Family',
  work: 'Work',
  politics: 'Politics',
  religion: 'Religion',
  health: 'Health',
  other: 'Other',
}

function computeStats(sessions: Session[]) {
  if (sessions.length === 0) return { avgAlignment: null, resolved: 0, topTheme: null }

  const resolved = sessions.filter((s) => s.status === 'resolved')
  const withScore = resolved.filter((s) => s.emotional_alignment_score != null)
  const avgAlignment =
    withScore.length > 0
      ? withScore.reduce((sum, s) => sum + (s.emotional_alignment_score ?? 0), 0) / withScore.length
      : null

  const categoryCounts: Record<string, number> = {}
  for (const s of sessions) {
    if (s.category) categoryCounts[s.category] = (categoryCounts[s.category] ?? 0) + 1
  }
  const topTheme = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

  return { avgAlignment, resolved: resolved.length, topTheme }
}

function WorkplaceSessionCard({ session, onDeleted }: { session: Session; onDeleted: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  async function handleDelete() {
    setLoading(true)
    try {
      const { deleteSession } = await import('@/actions/sessions')
      const result = await deleteSession(session.id)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success('Session deleted')
      setModalOpen(false)
      onDeleted()
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  const isResolved = session.status === 'resolved'
  const score = session.emotional_alignment_score ?? session.avg_rating

  return (
    <>
      <div className="relative group border rounded-2xl bg-card hover:shadow-md hover:-translate-y-px transition-all duration-200 hover:border-positive-blue/30">
        <Link href={`/sessions/${session.id}`} className="block px-5 py-4">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="font-medium text-sm leading-snug line-clamp-2 flex-1 text-foreground">
              {session.title}
            </h3>
            <span
              className={cn(
                'shrink-0 inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border',
                isResolved
                  ? 'bg-positive-green/10 text-positive-green border-positive-green/20'
                  : 'bg-positive-amber/10 text-positive-amber border-positive-amber/20'
              )}
            >
              {isResolved ? (
                <CheckCircle2 className="w-3 h-3" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-positive-amber inline-block" />
              )}
              {isResolved ? 'Resolved' : 'In Progress'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {session.topic && (
              <span className="flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                {session.topic}
              </span>
            )}
            {score != null && (
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-positive-blue" />
                <span className="text-positive-blue font-medium">{score.toFixed(1)}</span>
                <span>alignment</span>
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDate(session.created_at)}
            </span>
          </div>
        </Link>

        <div ref={menuRef} className="absolute top-3 right-3 z-10">
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); setMenuOpen((v) => !v) }}
            aria-label="Session options"
            className={cn(
              'w-7 h-7 rounded-md flex items-center justify-center transition-colors',
              'text-muted-foreground hover:text-foreground hover:bg-muted',
              menuOpen ? 'opacity-100 bg-muted' : 'opacity-0 group-hover:opacity-100'
            )}
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-8 w-52 bg-background border rounded-xl shadow-lg py-1 z-20">
              <button
                type="button"
                onClick={() => { setMenuOpen(false); setModalOpen(true) }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete this session
              </button>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        open={modalOpen}
        title="Delete this session?"
        description="This removes the session and its history. This cannot be undone."
        confirmLabel="Delete"
        destructive
        loading={loading}
        onConfirm={handleDelete}
        onCancel={() => setModalOpen(false)}
      />
    </>
  )
}

export function BusinessDashboard({ sessions }: Props) {
  const [fileName, setFileName] = useState<string | null>(null)
  const [localSessions, setLocalSessions] = useState<Session[]>(sessions)
  const stats = computeStats(localSessions)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    toast.info('Policy upload coming soon — RAG integration in progress')
    e.target.value = ''
  }

  function handleSessionDeleted(id: string) {
    setLocalSessions((prev) => prev.filter((s) => s.id !== id))
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">

      {/* Header */}
      <div className="bg-gradient-to-br from-positive-blue/10 to-positive-green/5 border border-positive-blue/15 rounded-2xl px-8 py-7">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-positive-blue/10 flex items-center justify-center shrink-0">
              <Briefcase className="w-6 h-6 text-positive-blue" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 mb-1">
                <h1 className="text-2xl font-semibold tracking-tight text-slate-800">
                  Workplace Harmony AI
                </h1>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-positive-blue text-white">
                  Enterprise Mode
                </span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">
                Policy-aware mediation for teams. Resolve workplace conflicts through AI guidance
                anchored in your company values, HR policies, and professional standards.
              </p>
            </div>
          </div>
          <Link
            href="/sessions/new?mode=business"
            className="shrink-0 inline-flex items-center gap-2 bg-positive-blue hover:bg-positive-blue/90 text-white rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors shadow-sm whitespace-nowrap focus-visible:ring-2 focus-visible:ring-positive-blue/40 focus-visible:ring-offset-2"
          >
            Start Mediation
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Workplace Sessions */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Workplace Sessions
          </h2>
          <span className="text-xs text-muted-foreground">
            {localSessions.length} {localSessions.length === 1 ? 'session' : 'sessions'}
          </span>
        </div>

        {localSessions.length === 0 ? (
          <div className="border border-dashed border-positive-blue/20 rounded-2xl p-10 text-center">
            <div className="w-12 h-12 rounded-full bg-positive-blue/10 flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-5 h-5 text-positive-blue" />
            </div>
            <p className="text-slate-600 text-sm font-medium mb-1">No workplace sessions yet</p>
            <p className="text-muted-foreground text-xs mb-5 max-w-xs mx-auto">
              Start your first policy-aware mediation to resolve a team conflict.
            </p>
            <Link
              href="/sessions/new?mode=business"
              className="inline-flex items-center gap-2 bg-positive-blue hover:bg-positive-blue/90 text-white rounded-xl px-4 py-2 text-sm font-semibold transition-colors shadow-sm"
            >
              Start Mediation
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {localSessions.map((s) => (
              <WorkplaceSessionCard
                key={s.id}
                session={s}
                onDeleted={() => handleSessionDeleted(s.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Policy Upload Panel */}
        <div className="border rounded-2xl p-6 bg-card space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-positive-blue/10 flex items-center justify-center">
              <FileText className="w-4 h-4 text-positive-blue" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Company Policy</h2>
              <p className="text-xs text-muted-foreground">Upload your HR handbook or policies</p>
            </div>
          </div>

          <label className="block">
            <div className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-positive-blue/40 hover:bg-positive-blue/5 transition-colors">
              <Upload className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground mb-1">Upload Company Policy</p>
              <p className="text-xs text-muted-foreground">PDF or text file — feeds AI context</p>
              {fileName && (
                <p className="mt-2 text-xs text-positive-blue font-medium">{fileName}</p>
              )}
            </div>
            <input
              type="file"
              accept=".pdf,.txt,.doc,.docx"
              className="sr-only"
              onChange={handleFileChange}
            />
          </label>

          <div className="rounded-lg bg-positive-amber/10 border border-positive-amber/20 px-3 py-2.5">
            <p className="text-xs text-positive-amber leading-relaxed">
              <span className="font-semibold">3 policy documents seeded</span> — Conflict Resolution,
              Inclusion Standards, and EAP Guidelines are active for all sessions.
            </p>
          </div>
        </div>

        {/* Organization Insights */}
        <div className="border rounded-2xl p-6 bg-card space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-positive-green/10 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-positive-green" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Organization Insights</h2>
              <p className="text-xs text-muted-foreground">Aggregate patterns across sessions</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 border px-4 py-3">
              <div className="flex items-center gap-2.5">
                <TrendingUp className="w-4 h-4 text-positive-blue" />
                <span className="text-sm text-foreground">Avg Emotional Alignment</span>
              </div>
              <span className="text-sm font-semibold text-positive-blue">
                {stats.avgAlignment != null ? `${stats.avgAlignment.toFixed(1)} / 5` : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 border px-4 py-3">
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-positive-green" />
                <span className="text-sm text-foreground">Sessions Resolved</span>
              </div>
              <span className="text-sm font-semibold text-positive-green">
                {stats.resolved > 0 ? `${stats.resolved}` : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 border px-4 py-3">
              <div className="flex items-center gap-2.5">
                <BarChart3 className="w-4 h-4 text-positive-amber" />
                <span className="text-sm text-foreground">Most Common Theme</span>
              </div>
              {stats.topTheme ? (
                <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                  {CATEGORY_LABELS[stats.topTheme] ?? stats.topTheme}
                </span>
              ) : (
                <span className="text-sm font-semibold text-muted-foreground">—</span>
              )}
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Analytics populate after team sessions are completed.
          </p>
        </div>
      </div>
    </div>
  )
}
