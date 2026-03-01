'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { ArrowLeft, Briefcase } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { MediationCard } from '@/components/features/sessions/MediationCard'
import { MessageBubble } from '@/components/features/sessions/MessageBubble'
import { ChatInput } from '@/components/features/sessions/ChatInput'
import { EmotionalMeter } from '@/components/features/sessions/EmotionalMeter'
import { FinalSummary } from '@/components/features/sessions/FinalSummary'
import type {
  Message,
  Session,
  SessionSummary,
  MessageRating,
  MessageInteraction,
  InteractionType,
} from '@/types'

interface Props {
  session: Session
  initialMessages: Message[]
  initialRatings: MessageRating[]
  initialInteractions?: MessageInteraction[]
  businessMode: boolean
}

const statusConfig = {
  open: 'bg-positive-green/10 text-positive-green border-positive-green/20',
  resolved: 'bg-positive-blue/10 text-positive-blue border-positive-blue/20',
  archived: 'bg-muted text-muted-foreground border-border',
}

export function SessionChat({
  session,
  initialMessages,
  initialRatings,
  initialInteractions = [],
  businessMode,
}: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)

  // Legacy ratings (old sessions)
  const [ratings, setRatings] = useState<Record<string, number>>(
    () => Object.fromEntries(initialRatings.map((r) => [r.message_id, r.rating]))
  )

  // New adaptive interactions (new sessions)
  const [interactions, setInteractions] = useState<Record<string, { type: InteractionType; value: number }>>(
    () =>
      Object.fromEntries(
        initialInteractions.map((i) => [
          i.message_id,
          { type: i.interaction_type as InteractionType, value: i.response_value },
        ])
      )
  )

  // Prefer emotional_alignment_score; fall back to avg_rating for old sessions
  const [emotionalScore, setEmotionalScore] = useState<number | null>(
    session.emotional_alignment_score ?? session.avg_rating
  )
  const [summary, setSummary] = useState<SessionSummary | null>(session.summary)
  const [showSummary, setShowSummary] = useState(Boolean(session.summary))
  const [isAIThinking, setIsAIThinking] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  function handleMessage(
    userContent: string,
    aiContent: string,
    aiId: string,
    aiMeta?: Message['meta'],
    newSummary?: SessionSummary | null,
    newAvgRating?: number | null
  ) {
    const now = new Date().toISOString()
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), session_id: session.id, role: 'user', content: userContent, created_at: now },
      { id: aiId, session_id: session.id, role: 'mediator', content: aiContent, meta: aiMeta ?? null, created_at: now },
    ])
    if (newAvgRating != null) setEmotionalScore(newAvgRating)
    if (newSummary) {
      setSummary(newSummary)
      setShowSummary(true)
    }
  }

  async function handleInteract(messageId: string, type: InteractionType, value: number) {
    const { submitInteraction, sendMessage } = await import('@/actions/sessions')

    // 1. Store the interaction and update scores
    const result = await submitInteraction(session.id, messageId, type, value)
    if (!result.success) {
      toast.error(result.error)
      return
    }

    setInteractions((prev) => ({ ...prev, [messageId]: { type, value } }))
    if (type === 'scale') {
      setRatings((prev) => ({ ...prev, [messageId]: value }))
    }
    if (result.data.emotionalAlignmentScore != null) {
      setEmotionalScore(result.data.emotionalAlignmentScore)
    }

    // If summary was triggered by this interaction, show it and stop
    if (result.data.summary) {
      setSummary(result.data.summary)
      setShowSummary(true)
      return
    }

    // 2. Auto-trigger next AI step — the interaction IS the user's response
    const responseText = type === 'scale'
      ? `${value}`
      : value === 1 ? 'Yes' : 'No'

    setIsAIThinking(true)
    try {
      const effectiveBM = businessMode || session.business_mode
      const aiResult = await sendMessage(session.id, responseText, effectiveBM)

      if (!aiResult.success) {
        toast.error(aiResult.error)
        return
      }

      const now = new Date().toISOString()
      setMessages((prev) => [
        ...prev,
        {
          id: aiResult.data.userMessage.id,
          session_id: session.id,
          role: 'user',
          content: responseText,
          created_at: now,
        },
        {
          id: aiResult.data.aiMessage.id,
          session_id: session.id,
          role: 'mediator',
          content: aiResult.data.aiMessage.content,
          meta: (aiResult.data.aiMessage as Message).meta ?? null,
          created_at: now,
        },
      ])

      if (aiResult.data.emotionalAlignmentScore != null) {
        setEmotionalScore(aiResult.data.emotionalAlignmentScore)
      }
      if (aiResult.data.summary) {
        setSummary(aiResult.data.summary)
        setShowSummary(true)
      }
    } finally {
      setIsAIThinking(false)
    }
  }

  const isDisabled = session.status !== 'open' || showSummary || isAIThinking

  let mediatorCount = 0
  const mediatorTotal = messages.filter((m) => m.role === 'mediator').length

  const exchangeLabel =
    mediatorTotal === 0
      ? 'Starting your session…'
      : mediatorTotal === 1
        ? 'Building Common Ground · 1 exchange'
        : `Building Common Ground · ${mediatorTotal} exchanges`

  const effectiveBusinessMode = businessMode || session.business_mode
  const appName = effectiveBusinessMode ? 'Workplace Harmony AI' : 'Middle Me'

  return (
    <div className="flex flex-col h-screen bg-slate-50/30">
      {/* Header */}
      <div className="border-b px-6 py-4 flex items-center gap-4 bg-background">
        <Link
          href="/sessions"
          className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
          aria-label="Back to sessions"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold text-sm truncate">{session.title}</h1>
          {session.topic && (
            <p className="text-xs text-muted-foreground">{session.topic}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {effectiveBusinessMode && (
            <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border bg-positive-blue/10 text-positive-blue border-positive-blue/20">
              <Briefcase className="w-3 h-3" />
              {appName} · Policy-Aware Mediation
            </span>
          )}
          <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full border', statusConfig[session.status])}>
            {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
          </span>
        </div>
      </div>

      {/* Progress + Emotional Meter */}
      <div className="border-b bg-background px-6 py-2 space-y-1.5">
        <p className="text-xs text-muted-foreground">{exchangeLabel}</p>
        <EmotionalMeter emotionalScore={emotionalScore} />
      </div>

      {/* Messages or Final Summary */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        {showSummary && summary ? (
          <div className="pb-8">
            <FinalSummary summary={summary} sessionTitle={session.title} businessMode={effectiveBusinessMode} />
            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={() => setShowSummary(false)}
                className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4"
              >
                View conversation history
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-16 px-4">
                <div className="w-14 h-14 rounded-full bg-positive-blue/10 border border-positive-blue/15 flex items-center justify-center mb-5">
                  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-positive-blue/60" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H7l5-8v4h4l-5 8z" fill="currentColor" />
                  </svg>
                </div>
                <p className="text-slate-700 text-base font-medium max-w-sm leading-relaxed mb-2">
                  No messages yet
                </p>
                <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
                  If the opening message did not appear, start the conversation below. Check the terminal for errors if the issue persists.
                </p>
              </div>
            ) : (
              messages.map((m) => {
                if (m.role === 'mediator') {
                  const idx = mediatorCount++
                  const interaction = interactions[m.id]
                  return (
                    <MediationCard
                      key={m.id}
                      message={m}
                      mediatorIndex={idx}
                      businessMode={effectiveBusinessMode}
                      onInteract={handleInteract}
                      interactedValue={interaction?.value}
                      // Legacy backwards compat
                      ratedValue={ratings[m.id]}
                    />
                  )
                }
                return <MessageBubble key={m.id} message={m} />
              })
            )}
            {summary && !showSummary && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowSummary(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-positive-green hover:bg-positive-green/90 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-positive-green/40 focus-visible:ring-offset-2"
                >
                  View Common Ground Summary
                </button>
              </div>
            )}

            {/* AI thinking indicator — shown while auto-generating next step after interaction */}
            {isAIThinking && (
              <div className="flex flex-col gap-2 w-full max-w-[88%]">
                <div className="flex items-center gap-2 px-1">
                  <div className="w-5 h-5 rounded-full bg-positive-blue/10 flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 16 16" fill="none" className="w-3 h-3 text-positive-blue" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 1.5C4.41 1.5 1.5 4.41 1.5 8S4.41 14.5 8 14.5 14.5 11.59 14.5 8 11.59 1.5 8 1.5zm0 2.25a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zM8 12a4 4 0 0 1-3.46-2 3.98 3.98 0 0 1 6.92 0A4 4 0 0 1 8 12z" fill="currentColor" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-positive-blue uppercase tracking-wide">
                    {effectiveBusinessMode ? 'Workplace Harmony AI' : 'Middle Me'}
                  </span>
                </div>
                <div className="bg-positive-blue/5 border border-positive-blue/15 rounded-2xl rounded-tl-sm px-5 py-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-positive-blue/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-positive-blue/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-positive-blue/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      {isDisabled && !showSummary ? (
        <div className="border-t px-6 py-5 text-center text-sm text-muted-foreground bg-background">
          This session is {session.status}.{' '}
          <Link href="/sessions/new" className="underline underline-offset-4 hover:text-foreground">
            Start a new mediation
          </Link>
        </div>
      ) : showSummary ? (
        <div className="border-t px-6 py-4 text-center bg-background">
          <Link
            href="/sessions/new"
            className="inline-flex items-center gap-2 bg-positive-blue hover:bg-positive-blue/90 text-white text-sm font-semibold rounded-xl px-5 py-2.5 transition-colors focus-visible:ring-2 focus-visible:ring-positive-blue/40 focus-visible:ring-offset-2"
          >
            Start a new mediation
          </Link>
        </div>
      ) : (
        <div className="border-t px-6 py-4 bg-background">
          <ChatInput
            sessionId={session.id}
            onMessage={handleMessage}
            businessMode={effectiveBusinessMode}
          />
        </div>
      )}
    </div>
  )
}
