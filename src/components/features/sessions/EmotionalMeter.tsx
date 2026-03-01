import { Shield, Lightbulb, Handshake, Smile, Leaf } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface Props {
  emotionalScore?: number | null
  avgRating?: number | null
  className?: string
}

const STAGES: { min: number; label: string; color: string; icon: LucideIcon }[] = [
  { min: 0,   label: 'Guarded',               color: 'bg-slate-300',          icon: Shield },
  { min: 1.5, label: 'Opening Up',            color: 'bg-positive-blue/60',   icon: Lightbulb },
  { min: 2.5, label: 'Finding Common Ground', color: 'bg-positive-blue',      icon: Handshake },
  { min: 3.5, label: 'Connected',             color: 'bg-positive-green',     icon: Smile },
  { min: 4.2, label: 'Ready for Resolution',  color: 'bg-positive-green',     icon: Leaf },
]

function getStage(score: number | null) {
  if (score == null) return STAGES[0]
  const matched = [...STAGES].reverse().find((s) => score >= s.min)
  return matched ?? STAGES[0]
}

export function EmotionalMeter({ emotionalScore, avgRating, className }: Props) {
  const score = emotionalScore ?? avgRating ?? null
  const stage = getStage(score)
  const pct = score != null ? Math.min((score / 5) * 100, 100) : 0
  const StageIcon = stage.icon

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="flex-1 h-2.5 rounded-full bg-slate-200 overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-700', stage.color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span
        className={cn(
          'flex items-center gap-1 text-xs font-medium whitespace-nowrap',
          score != null ? 'text-positive-blue' : 'text-muted-foreground'
        )}
      >
        <StageIcon className="w-3 h-3 shrink-0" />
        {stage.label}
        {score != null && (
          <span className="ml-0.5 text-muted-foreground font-normal">
            ({score.toFixed(1)})
          </span>
        )}
      </span>
    </div>
  )
}
