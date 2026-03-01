'use client'

import { useState } from 'react'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { Message, InteractionType } from '@/types'

const STEP_LABELS: Record<string, string> = {
  deescalation: 'De-escalating Tension',
  belief_probe: 'Exploring Your Beliefs',
  fact_probe: 'Checking the Facts',
  values_probe: 'Finding Shared Values',
  reflection: 'Reflecting Together',
  // Legacy labels
  breakdown: 'Understanding Both Sides',
  shared_values: 'Finding Shared Values',
  misunderstandings: 'Clearing Misunderstandings',
  closing: 'Reaching Resolution',
}

const FALLBACK_STEP_LABELS = [
  'Understanding Both Sides',
  'De-escalating Tension',
  'Finding Shared Values',
  'Building Common Ground',
  'Paths Forward',
  'Reaching Resolution',
]

interface Props {
  message: Message
  mediatorIndex: number
  businessMode?: boolean
  // New adaptive interaction handler
  onInteract?: (messageId: string, type: InteractionType, value: number) => void
  interactedValue?: number
  // Legacy backwards compat
  onRate?: (messageId: string, rating: number) => void
  ratedValue?: number
}

export function MediationCard({
  message,
  mediatorIndex,
  businessMode,
  onInteract,
  interactedValue,
  onRate,
  ratedValue,
}: Props) {
  const stepType = message.meta?.step_type
  const stepLabel = stepType && STEP_LABELS[stepType]
    ? STEP_LABELS[stepType]
    : FALLBACK_STEP_LABELS[Math.min(mediatorIndex, FALLBACK_STEP_LABELS.length - 1)]

  const interaction = message.meta?.interaction
  const legacyQuestion = message.meta?.follow_up_question

  const [hoverValue, setHoverValue] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleInteract(type: InteractionType, value: number) {
    if (submitting) return
    setSubmitting(true)
    try {
      if (onInteract) {
        await onInteract(message.id, type, value)
      } else if (onRate && type === 'scale') {
        await onRate(message.id, value)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const displayedScaleValue = hoverValue ?? interactedValue ?? ratedValue ?? null
  const hasResponded = (interactedValue != null || ratedValue != null)

  const sourceName = businessMode ? 'Workplace Harmony AI' : 'Middle Me'

  return (
    <div className="flex flex-col gap-2 w-full max-w-[88%]">
      {/* Source label */}
      <div className="flex items-center gap-2 px-1">
        <div className="w-5 h-5 rounded-full bg-positive-blue/10 flex items-center justify-center shrink-0">
          <svg
            viewBox="0 0 16 16"
            fill="none"
            className="w-3 h-3 text-positive-blue"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 1.5C4.41 1.5 1.5 4.41 1.5 8S4.41 14.5 8 14.5 14.5 11.59 14.5 8 11.59 1.5 8 1.5zm0 2.25a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zM8 12a4 4 0 0 1-3.46-2 3.98 3.98 0 0 1 6.92 0A4 4 0 0 1 8 12z"
              fill="currentColor"
            />
          </svg>
        </div>
        <span className="text-xs font-semibold text-positive-blue uppercase tracking-wide">
          {sourceName}
          {businessMode && (
            <span className="ml-1.5 normal-case font-medium text-positive-blue/60">· Policy-Aware</span>
          )}
        </span>
      </div>

      {/* Card */}
      <div className="bg-positive-blue/5 border border-positive-blue/15 rounded-2xl rounded-tl-sm px-5 py-4 space-y-3">
        {/* Step label */}
        <div className="inline-flex items-center gap-1.5 bg-white/80 text-positive-blue text-xs font-semibold px-2.5 py-1 rounded-full border border-positive-blue/20">
          <span className="w-1.5 h-1.5 rounded-full bg-positive-blue inline-block" />
          {stepLabel}
        </div>

        {/* Message body */}
        <p className="text-base text-slate-700 leading-[1.7] font-normal">
          {message.content}
        </p>

        {/* Adaptive interaction section */}
        {interaction ? (
          <div className="mt-1 pt-3 border-t border-positive-blue/20 space-y-3">
            <p className="text-sm text-positive-blue font-medium leading-relaxed">
              {interaction.question}
            </p>

            {interaction.type === 'scale' ? (
              <ScaleInteraction
                disabled={submitting || hasResponded}
                displayValue={displayedScaleValue}
                respondedValue={interactedValue ?? ratedValue ?? null}
                onHover={setHoverValue}
                onLeave={() => setHoverValue(null)}
                onSelect={(v) => handleInteract('scale', v)}
              />
            ) : (
              <YesNoInteraction
                disabled={submitting || hasResponded}
                respondedValue={interactedValue ?? null}
                onSelect={(v) => handleInteract('yes_no', v)}
              />
            )}
          </div>
        ) : legacyQuestion ? (
          /* Legacy: show old follow_up_question + star rating */
          <div className="mt-1 pt-3 border-t border-positive-blue/20 space-y-3">
            <p className="text-sm text-positive-blue font-medium italic leading-relaxed">
              {legacyQuestion}
            </p>
            {(onRate || onInteract) && (
              <ScaleInteraction
                disabled={submitting || hasResponded}
                displayValue={displayedScaleValue}
                respondedValue={ratedValue ?? null}
                onHover={setHoverValue}
                onLeave={() => setHoverValue(null)}
                onSelect={(v) => handleInteract('scale', v)}
              />
            )}
          </div>
        ) : null}
      </div>

      {/* Timestamp */}
      <p className="text-xs text-muted-foreground px-1">
        {formatDate(message.created_at)}
      </p>
    </div>
  )
}

// ─── Scale (1–5) sub-component ────────────────────────────────────────────────

function ScaleInteraction({
  disabled,
  displayValue,
  respondedValue,
  onHover,
  onLeave,
  onSelect,
}: {
  disabled: boolean
  displayValue: number | null
  respondedValue: number | null
  onHover: (v: number) => void
  onLeave: () => void
  onSelect: (v: number) => void
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          aria-label={`${star} out of 5`}
          onClick={() => onSelect(star)}
          onMouseEnter={() => onHover(star)}
          onMouseLeave={onLeave}
          className={cn(
            'w-7 h-7 rounded-full flex items-center justify-center transition-all duration-150 hover:scale-110',
            disabled && respondedValue != null ? 'cursor-default' : 'disabled:opacity-50',
            displayValue != null && star <= displayValue
              ? 'text-positive-amber'
              : 'text-slate-300 hover:text-positive-amber/70'
          )}
        >
          <svg
            viewBox="0 0 24 24"
            fill={displayValue != null && star <= displayValue ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth={2}
            className="w-4 h-4"
          >
            <path
              strokeLinejoin="round"
              strokeLinecap="round"
              d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
            />
          </svg>
        </button>
      ))}
      {respondedValue != null && (
        <span className="ml-1 text-xs text-positive-amber font-medium">{respondedValue}/5</span>
      )}
    </div>
  )
}

// ─── Yes / No sub-component ───────────────────────────────────────────────────

function YesNoInteraction({
  disabled,
  respondedValue,
  onSelect,
}: {
  disabled: boolean
  respondedValue: number | null
  onSelect: (v: number) => void
}) {
  const answered = respondedValue != null
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onSelect(1)}
        className={cn(
          'px-5 py-1.5 rounded-full text-sm font-semibold border transition-colors',
          answered
            ? respondedValue === 1
              ? 'bg-positive-blue text-white border-positive-blue'
              : 'bg-white text-slate-400 border-slate-200 cursor-default'
            : 'bg-white text-positive-blue border-positive-blue/30 hover:bg-positive-blue/5 disabled:opacity-50'
        )}
      >
        Yes
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onSelect(0)}
        className={cn(
          'px-5 py-1.5 rounded-full text-sm font-semibold border transition-colors',
          answered
            ? respondedValue === 0
              ? 'bg-slate-600 text-white border-slate-600'
              : 'bg-white text-slate-400 border-slate-200 cursor-default'
            : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50 disabled:opacity-50'
        )}
      >
        No
      </button>
    </div>
  )
}
