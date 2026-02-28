import Link from 'next/link'
import { MessageSquare, Clock } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import type { Session } from '@/types'

const statusConfig = {
  open: { label: 'Open', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  resolved: { label: 'Resolved', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  archived: { label: 'Archived', className: 'bg-muted text-muted-foreground border-border' },
}

export function SessionCard({ session }: { session: Session }) {
  const status = statusConfig[session.status]

  return (
    <Link
      href={`/sessions/${session.id}`}
      className="block border rounded-xl p-5 bg-card hover:shadow-sm hover:border-ring/30 transition-all"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-medium text-sm leading-snug line-clamp-2 flex-1">
          {session.title}
        </h3>
        <span
          className={cn(
            'shrink-0 text-xs font-medium px-2 py-0.5 rounded-full border',
            status.className
          )}
        >
          {status.label}
        </span>
      </div>
      {session.topic && (
        <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
          <MessageSquare className="w-3 h-3" />
          {session.topic}
        </p>
      )}
      <p className="text-xs text-muted-foreground flex items-center gap-1">
        <Clock className="w-3 h-3" />
        {formatDate(session.created_at)}
      </p>
    </Link>
  )
}
