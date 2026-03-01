'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MessageSquare, Clock, MoreVertical, Trash2, Briefcase, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'
import { cn, formatDate } from '@/lib/utils'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import type { Session } from '@/types'

const statusConfig = {
  open: { label: 'Open', className: 'bg-positive-green/10 text-positive-green border-positive-green/20' },
  resolved: { label: 'Resolved', className: 'bg-positive-blue/10 text-positive-blue border-positive-blue/20' },
  archived: { label: 'Archived', className: 'bg-muted text-muted-foreground border-border' },
}

type ModalState = 'delete-one' | null

export function SessionCard({ session }: { session: Session }) {
  const router = useRouter()
  const status = statusConfig[session.status]
  const [menuOpen, setMenuOpen] = useState(false)
  const [modal, setModal] = useState<ModalState>(null)
  const [loading, setLoading] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  async function handleConfirm() {
    setLoading(true)
    try {
      if (modal === 'delete-one') {
        const { deleteSession } = await import('@/actions/sessions')
        const result = await deleteSession(session.id)
        if (!result.success) {
          toast.error(result.error)
          return
        }
        toast.success('Conversation deleted')
      }
      setModal(null)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  const score = session.emotional_alignment_score ?? session.avg_rating

  return (
    <>
      <div className="relative group border rounded-xl bg-card hover:shadow-md hover:-translate-y-px hover:border-positive-blue/30 transition-all duration-200">
        <Link href={`/sessions/${session.id}`} className="block p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h3 className="font-medium text-sm leading-snug line-clamp-2 flex-1">
              {session.title}
            </h3>
            <div className="flex items-center gap-1.5 shrink-0">
              {session.business_mode && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full border bg-positive-blue/10 text-positive-blue border-positive-blue/20 inline-flex items-center gap-1">
                  <Briefcase className="w-2.5 h-2.5" />
                  Workplace
                </span>
              )}
              <span
                className={cn(
                  'text-xs font-medium px-2 py-0.5 rounded-full border',
                  status.className
                )}
              >
                {status.label}
              </span>
            </div>
          </div>

          {session.topic && (
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              {session.topic}
            </p>
          )}

          <div className="flex items-center gap-3 flex-wrap">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDate(session.created_at)}
            </p>
            {score != null && (
              <p className="text-xs flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-positive-blue" />
                <span className="text-positive-blue font-medium">{score.toFixed(1)}</span>
                <span className="text-muted-foreground">alignment</span>
              </p>
            )}
          </div>
        </Link>

        {/* Overflow menu button */}
        <div ref={menuRef} className="absolute top-3 right-3 z-10">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              setMenuOpen((v) => !v)
            }}
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
                onClick={() => { setMenuOpen(false); setModal('delete-one') }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete this conversation
              </button>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        open={modal === 'delete-one'}
        title="Delete this conversation?"
        description="This removes its learned context and cannot be undone."
        confirmLabel="Delete"
        destructive
        loading={loading}
        onConfirm={handleConfirm}
        onCancel={() => setModal(null)}
      />
    </>
  )
}
